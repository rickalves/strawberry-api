import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { PlotsService } from './plots.service';
import { Plot } from './plot.entity';
import { CreatePlotDto } from './dto/create-plot.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdatePlotDto } from './dto/update-plot.dto';

type RepoMethods =
  | 'create'
  | 'save'
  | 'find'
  | 'findOne'
  | 'update'
  | 'remove'
  | 'createQueryBuilder';

type RepoMock = jest.Mocked<Pick<Repository<Plot>, RepoMethods>>;
// Subconjunto mínimo do QueryBuilder que o método usa
type QBSubset = Pick<
  SelectQueryBuilder<Plot>,
  'leftJoin' | 'select' | 'where' | 'getRawOne'
>;

describe('PlotsService', () => {
  let service: PlotsService;
  let repo: RepoMock;

  // Mock do QueryBuilder encadeável
  let qb: jest.Mocked<QBSubset>;

  beforeEach(async () => {
    qb = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(), // será configurado por teste
    } as unknown as jest.Mocked<QBSubset>;

    const repoMock: RepoMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlotsService,
        {
          provide: getRepositoryToken(Plot),
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<PlotsService>(PlotsService);
    repo = module.get<RepoMock>(getRepositoryToken(Plot));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('cria e salva um plot com campos válidos', async () => {
      const dto: CreatePlotDto = {
        nome: 'Canteiro A',
        area_m2: 25.5,
        inicio_plantio: '2025-09-01',
      };

      const created: Plot = {
        id: '1',
        nome: dto.nome,
        area_m2: dto.area_m2,
        inicio_plantio: dto.inicio_plantio,
        colheitas: [],
      };

      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('retorna todos ordenados por nome ASC', async () => {
      const items: Plot[] = [
        {
          id: '1',
          nome: 'A',
          area_m2: 10,
          inicio_plantio: '2025-07-01',
          colheitas: [],
        },
        {
          id: '2',
          nome: 'B',
          area_m2: 20,
          inicio_plantio: undefined,
          colheitas: [],
        },
      ];

      repo.find.mockResolvedValue(items);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({ order: { nome: 'ASC' } });
      expect(result).toEqual(items);
    });
  });

  describe('findOne', () => {
    it('retorna um plot existente', async () => {
      const item: Plot = {
        id: '123',
        nome: 'X',
        area_m2: 12.34,
        inicio_plantio: undefined,
        colheitas: [],
      };

      repo.findOne.mockResolvedValue(item);

      const result = await service.findOne('123');

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
      expect(result).toEqual(item);
    });

    it('lança NotFoundException quando não existir', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow(
        'Canteiro não encontrado',
      );
    });
  });

  describe('update', () => {
    it('atualiza e retorna o plot atualizado', async () => {
      const id = '42';
      const dto: UpdatePlotDto = {
        nome: 'Novo nome',
        area_m2: 30.0,
      };
      const atualizado: Plot = {
        id,
        nome: dto.nome ?? 'Novo nome',
        area_m2: dto.area_m2 ?? 30.0,
        inicio_plantio: undefined,
        colheitas: [],
      };

      repo.findOne.mockResolvedValue(atualizado);
      const result = await service.update(id, dto);

      expect(repo.update).toHaveBeenCalledWith(id, dto);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(atualizado);
    });
  });

  describe('remove', () => {
    it('remove um plot existente e retorna { ok: true }', async () => {
      const id = '7';
      const plot: Plot = {
        id,
        nome: 'Del',
        area_m2: 15,
        inicio_plantio: undefined,
        colheitas: [],
      };

      repo.findOne.mockResolvedValue(plot);
      repo.remove.mockResolvedValue(plot);

      const result = await service.remove(id);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(repo.remove).toHaveBeenCalledWith(plot);
      expect(result).toEqual({ ok: true });
    });

    it('propaga NotFoundException se não existir (via findOne)', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
  describe('summary', () => {
    it('retorna { plotId, total_kg } somando peso_kg (sum como string)', async () => {
      // Arrange
      const id = 'plot-123';
      qb.getRawOne.mockResolvedValue({ sum: '12.5' });

      // Act
      const result = await service.summary(id);

      // Assert (verifica chamada do builder)
      expect(repo.createQueryBuilder).toHaveBeenCalledWith('p');
      expect(qb.leftJoin).toHaveBeenCalledWith('p.colheitas', 'h');
      expect(qb.select).toHaveBeenCalledWith(
        'COALESCE(SUM(h.peso_kg), 0)',
        'sum',
      );
      expect(qb.where).toHaveBeenCalledWith('p.id = :id', { id });
      expect(qb.getRawOne).toHaveBeenCalled();

      // Assert (verifica conversão do sum)
      expect(result).toEqual({ plotId: id, total_kg: 12.5 });
    });
  });
});

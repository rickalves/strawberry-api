import { Test, TestingModule } from '@nestjs/testing';
import { PlotsController } from './plots.controller';
import { PlotsService } from './plots.service';
import { CreatePlotDto } from './dto/create-plot.dto';
import { UpdatePlotDto } from './dto/update-plot.dto';
import { Plot } from './plot.entity';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthService } from '../auth/auth.service';

// Tipagem do retorno de summary
type Summary = { plotId: string; total_kg: number };

// Mock tipado do service (somente métodos usados pelo controller)
type PlotsServiceMock = jest.Mocked<{
  create: (dto: CreatePlotDto) => Promise<Plot>;
  findAll: () => Promise<Plot[]>;
  findOne: (id: string) => Promise<Plot | null>;
  update: (id: string, dto: UpdatePlotDto) => Promise<Plot>;
  remove: (id: string) => Promise<{ affected: number }>;
  summary: (id: string) => Promise<Summary>;
}>;

describe('PlotsController', () => {
  let controller: PlotsController;
  let service: PlotsServiceMock;

  beforeEach(async () => {
    const serviceMock: PlotsServiceMock = {
      create: jest.fn<Promise<Plot>, [CreatePlotDto]>(),
      findAll: jest.fn<Promise<Plot[]>, []>(),
      findOne: jest.fn<Promise<Plot | null>, [string]>(),
      update: jest.fn<Promise<Plot>, [string, UpdatePlotDto]>(),
      remove: jest.fn<Promise<{ affected: number }>, [string]>(),
      summary: jest.fn<Promise<Summary>, [string]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlotsController],
      providers: [
        {
          provide: PlotsService,
          useValue: serviceMock,
        },
        // mocks para os guards usados por @UseGuards(...)
        {
          provide: AccessTokenGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        // mock do AuthService para injeção no AccessTokenGuard
        {
          provide: AuthService,
          useValue: {
            validateToken: jest.fn().mockResolvedValue({ id: 'u1' }),
          },
        },
      ],
    }).compile();

    controller = module.get<PlotsController>(PlotsController);
    service = module.get<PlotsServiceMock>(PlotsService);
  });

  describe('POST /plots → create', () => {
    it('deve delegar para service.create e retornar o resultado', async () => {
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

      service.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('GET /plots → findAll', () => {
    it('deve delegar para service.findAll e retornar o resultado', async () => {
      const plots: Plot[] = [
        {
          id: '1',
          nome: 'Canteiro A',
          area_m2: 25.5,
          inicio_plantio: '2025-09-01',
          colheitas: [],
        },
        {
          id: '2',
          nome: 'Canteiro B',
          area_m2: 30,
          inicio_plantio: '2025-09-01',
          colheitas: [],
        },
      ];

      // Configura o mock para retornar a lista de plots
      service.findAll.mockResolvedValue(plots);
      // Chama o método do controller
      const result = await controller.findAll();
      // Verifica se o service.findAll foi chamado e o resultado retornado
      expect(service.findAll).toHaveBeenCalled();
      //Compara o resultado com a lista de plots
      expect(result).toEqual(plots);
    });
  });

  describe('GET /plots/:id → findOne', () => {
    it('deve delegar para service.findOne e retornar o resultado', async () => {
      const plot: Plot = {
        id: '1',
        nome: 'Canteiro A',
        area_m2: 25.5,
        inicio_plantio: '2025-09-01',
        colheitas: [],
      };

      service.findOne.mockResolvedValue(plot);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(plot);
    });

    it('deve retornar null se o plot não for encontrado', async () => {
      service.findOne.mockResolvedValue(null);
      const result = await controller.findOne('999');
      expect(service.findOne).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });
  });

  describe('PATCH /plots/:id → update', () => {
    it('deve delegar para service.update e retornar o resultado', async () => {
      const dto: UpdatePlotDto = { nome: 'Canteiro A Atualizado' };
      const updated: Plot = {
        id: '1',
        nome: dto.nome as string,
        area_m2: 25.5,
        inicio_plantio: '2025-09-01',
        colheitas: [],
      };

      service.update.mockResolvedValue(updated);

      const result = await controller.update('1', dto);

      expect(service.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('DELETE /plots/:id → remove', () => {
    it('deve delegar para service.remove e retornar o resultado', async () => {
      service.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual({ affected: 1 });
    });
    it('deve retornar affected: 0 se o plot não for encontrado', async () => {
      service.remove.mockResolvedValue({ affected: 0 });

      const result = await controller.remove('999');

      expect(service.remove).toHaveBeenCalledWith('999');
      expect(result).toEqual({ affected: 0 });
    });
  });

  describe('GET /plots/:id/summary → summary', () => {
    it('deve delegar para service.summary e retornar o resultado', async () => {
      const summary: Summary = { plotId: '1', total_kg: 150.5 };
      service.summary.mockResolvedValue(summary);

      const result = await controller.summary('1');

      expect(service.summary).toHaveBeenCalledWith('1');
      expect(result).toEqual(summary);
    });
  });
});

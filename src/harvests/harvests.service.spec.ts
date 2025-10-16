import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { HarvestsService } from './harvests.service';
import { Harvest } from './harvest.entity';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { Plot } from '../plots/plot.entity';

type RepoMethods = 'create' | 'find' | 'save';
type PlotRepoMethods = 'find' | 'findOne';

type RepoMock = jest.Mocked<Pick<Repository<Harvest>, RepoMethods>>;
type PlotRepoMock = jest.Mocked<Pick<Repository<Plot>, PlotRepoMethods>>;

const mockPlot: Plot = {
  id: 'some-uuid',
  nome: 'Plot 1',
  area_m2: 50,
  inicio_plantio: '2023-01-01',
  colheitas: [],
};

const harvestsMock: Harvest[] = [
  {
    id: '1',
    data: '2023-10-10',
    peso_kg: 100,
    plot: mockPlot,
    qualidade: 'A',
  },
  {
    id: '2',
    data: '2023-09-10',
    peso_kg: 150,
    plot: mockPlot,
    qualidade: 'B',
  },
];

describe('HarvestsService', () => {
  let service: HarvestsService;
  let repo: RepoMock;
  let plotRepo: PlotRepoMock;

  beforeEach(async () => {
    const repoMock: RepoMock = {
      create: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    } as unknown as RepoMock;

    const plotRepoMock: PlotRepoMock = {
      find: jest.fn(),
      findOne: jest.fn(),
    } as unknown as PlotRepoMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HarvestsService,
        {
          provide: getRepositoryToken(Plot),
          useValue: plotRepoMock,
        },
        {
          provide: getRepositoryToken(Harvest),
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<HarvestsService>(HarvestsService);
    repo = module.get(getRepositoryToken(Harvest));
    plotRepo = module.get(getRepositoryToken(Plot));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('cria e retorna a nova colheita', async () => {
      const createHarvestDto: CreateHarvestDto = {
        data: '2023-10-10',
        peso_kg: 100,
        qualidade: 'high',
        plotId: 'some-uuid',
      };

      const createdHarvest: Harvest = {
        id: 'some-uuid',
        ...createHarvestDto,
        plot: mockPlot,
      };

      repo.create.mockReturnValue(createdHarvest);
      repo.save.mockResolvedValue(createdHarvest);
      plotRepo.findOne.mockResolvedValue(mockPlot);

      const result = await service.create(createHarvestDto);

      expect(plotRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'some-uuid' },
      });
      expect(repo.create).toHaveBeenCalledWith(createHarvestDto);
      expect(repo.save).toHaveBeenCalledWith(createdHarvest);
      expect(result).toEqual(createdHarvest);
    });
  });

  describe('findAll', () => {
    it('retorna todas as colheitas ordenadas por data DESC', async () => {
      repo.find.mockResolvedValue(harvestsMock);
      const result = await service.findAll();
      expect(result).toEqual(harvestsMock);
    });
  });

  describe('byPlot', () => {
    it('retorna todas as colheitas de um canteiro ordenadas por data DESC', async () => {
      repo.find.mockResolvedValue(harvestsMock);
      const result = await service.byPlot('some-uuid');
      expect(repo.find).toHaveBeenCalledWith({
        where: { plot: { id: 'some-uuid' } },
        relations: ['plot'],
        order: { data: 'DESC' },
      });
      expect(result).toEqual(harvestsMock);
    });
  });
});

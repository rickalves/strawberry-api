import { Test, TestingModule } from '@nestjs/testing';
import { HarvestsController } from './harvests.controller';
import { HarvestsService } from './harvests.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { Harvest } from './harvest.entity';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthService } from '../auth/auth.service';

// Mock do service usado pelo controller
type HarvestsServiceMock = jest.Mocked<{
  create: (dto: CreateHarvestDto) => Promise<Harvest>;
  findAll: () => Promise<Harvest[]>;
  byPlot: (plotId: string) => Promise<Harvest[]>;
}>;

const listMock: Harvest[] = [
  {
    id: '1',
    data: '2023-10-10',
    peso_kg: 100,
    qualidade: 'A',
    plot: {
      id: 'p1',
      nome: 'Plot 1',
      area_m2: 50,
      inicio_plantio: '2023-01-01',
      colheitas: [],
    },
  } as Harvest,
];

describe('HarvestsController', () => {
  let controller: HarvestsController;
  let service: HarvestsServiceMock;

  beforeEach(async () => {
    const serviceMock: HarvestsServiceMock = {
      create: jest.fn<Promise<Harvest>, [CreateHarvestDto]>(),
      findAll: jest.fn<Promise<Harvest[]>, []>(),
      byPlot: jest.fn<Promise<Harvest[]>, [string]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HarvestsController],
      providers: [
        {
          provide: HarvestsService,
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

    controller = module.get<HarvestsController>(HarvestsController);
    service = module.get<HarvestsServiceMock>(HarvestsService);
  });

  describe('POST /harvests → create', () => {
    it('deve delegar para service.create e retornar o resultado', async () => {
      const dto: CreateHarvestDto = {
        data: '2023-10-10',
        peso_kg: 100,
        qualidade: 'high',
        plotId: 'some-uuid',
      };

      const created: Harvest = {
        id: '1',
        data: dto.data,
        peso_kg: dto.peso_kg,
        qualidade: dto.qualidade,
        plot: {
          id: 'some-uuid',
          nome: 'Plot 1',
          area_m2: 50,
          inicio_plantio: '2023-01-01',
          colheitas: [],
        },
      } as Harvest;

      service.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('GET /harvests → findAll', () => {
    it('deve delegar para service.findAll e retornar o resultado', async () => {
      service.findAll.mockResolvedValue(listMock);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(listMock);
    });
  });

  describe('GET /harvests/plot/:plotId → byPlot', () => {
    it('deve delegar para service.byPlot e retornar o resultado', async () => {
      const plotId = 'some-uuid';
      service.byPlot.mockResolvedValue(listMock);

      const result = await controller.byPlot(plotId);

      expect(service.byPlot).toHaveBeenCalledWith(plotId);
      expect(result).toEqual(listMock);
    });
  });
});

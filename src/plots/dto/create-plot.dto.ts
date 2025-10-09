import {
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';

export class CreatePlotDto {
  @IsString()
  nome: string;

  @IsNumber()
  @Min(0.01)
  area_m2: number;

  @IsOptional()
  @IsDateString()
  inicio_plantio?: string;
}

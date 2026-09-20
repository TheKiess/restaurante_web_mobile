import { PartialType } from '@nestjs/mapped-types';
import { CreateItensCardapioDto } from './create-itens-cardapio.dto.js';

export class UpdateItensCardapioDto extends PartialType(CreateItensCardapioDto) {}

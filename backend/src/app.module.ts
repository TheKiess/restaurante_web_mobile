import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { MesasModule } from './mesas/mesas.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { ItensCardapioModule } from './itens-cardapio/itens-cardapio.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { ComandasModule } from './comandas/comandas.module.js';
import { ItensPedidoModule } from './itens-pedido/itens-pedido.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MesasModule,
    CategoriasModule,
    ItensCardapioModule,
    UsuariosModule,
    ComandasModule,
    ItensPedidoModule
  ],
})

export class AppModule {}
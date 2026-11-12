import { Module }                  from '@nestjs/common';
import { ConfigModule }            from '@nestjs/config';
import { PrismaModule }            from './prisma/prisma.module.js';
import { MesasModule }             from './mesas/mesas.module.js';
import { CategoriasModule }        from './categorias/categorias.module.js';
import { ItensCardapioModule }     from './itens-cardapio/itens-cardapio.module.js';
import { ReservasModule }          from './reservas/reservas.module.js';
import { InsumosModule }           from './insumos/insumos.module.js';
import { MovimentosEstoqueModule } from './movimentos-estoque/movimentos-estoque.module.js';
import { UsuariosModule }          from './usuarios/usuarios.module.js';
import { AuthModule }              from './auth/auth.module.js';
import { ComandasModule }          from './comandas/comandas.module.js';
import { ItensPedidoModule }       from './itens-pedido/itens-pedido.module.js';
import { PagamentosModule }        from './pagamentos/pagamentos.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MesasModule,
    CategoriasModule,
    ItensCardapioModule,
    UsuariosModule,
    AuthModule,
    ComandasModule,
    ItensPedidoModule,
    PagamentosModule,
    ReservasModule,
    InsumosModule,
    MovimentosEstoqueModule,
  ]
})

export class AppModule {}
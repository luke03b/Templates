/**
 * Tipi di supporto per scrivere handler Fastify in file separati dalle rotte
 * mantenendo l'inferenza dei tipi dagli schemi TypeBox.
 *
 * Esempio: `FastifyRequestTypeBox<typeof createItemSchema>` ha `request.body` tipizzato
 * come ItemInput, e `FastifyReplyTypeBox<...>` controlla che `reply.send()` riceva
 * un oggetto conforme allo schema di risposta.
 * (Pattern preso dalla documentazione ufficiale di @fastify/type-provider-typebox.)
 */
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type {
  ContextConfigDefault,
  FastifyBaseLogger,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteGenericInterface,
} from 'fastify';

export type FastifyTypeBox = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;

export type FastifyRequestTypeBox<TSchema extends FastifySchema> = FastifyRequest<
  RouteGenericInterface,
  RawServerDefault,
  RawRequestDefaultExpression,
  TSchema,
  TypeBoxTypeProvider
>;

export type FastifyReplyTypeBox<TSchema extends FastifySchema> = FastifyReply<
  RouteGenericInterface,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  ContextConfigDefault,
  TSchema,
  TypeBoxTypeProvider
>;

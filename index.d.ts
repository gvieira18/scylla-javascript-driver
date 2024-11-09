/* auto-generated by NAPI-RS */
/* eslint-disable */
/**
 * Batch statements
 *
 * A batch statement allows to execute many data-modifying statements at once.
 * These statements can be simple or prepared.
 * Only INSERT, UPDATE and DELETE statements are allowed.
 */
export declare class BatchStatement {
  constructor()
  /**
   * Appends a statement to the batch.
   *
   * _Warning_
   * Using simple statements with bind markers in batches is strongly discouraged. For each simple statement with a non-empty list of values in the batch, the driver will send a prepare request, and it will be done sequentially. Results of preparation are not cached between `session.batch` calls. Consider preparing the statements before putting them into the batch.
   */
  appendStatement(statement: Query | PreparedStatement): void
}
export type ScyllaBatchStatement = BatchStatement

export declare class Cluster {
  /**
   * Object config is in the format:
   * {
   *     nodes: Array<string>,
   * }
   */
  constructor(clusterConfig: ClusterConfig)
  /** Connect to the cluster */
  connect(keyspaceOrOptions?: string | ConnectionOptions | undefined | null, options?: ConnectionOptions | undefined | null): Promise<ScyllaSession>
}
export type ScyllaCluster = Cluster

export declare class Decimal {
  constructor(intVal: Array<number>, scale: number)
  /** Returns the string representation of the Decimal. */
  toString(): string
}

/**
 * A double precision float number.
 *
 * Due to the nature of numbers in JavaScript, it's hard to distinguish between integers and floats, so this type is used to represent
 * double precision float numbers while any other JS number will be treated as an integer. (This is not the case for BigInts, which are always treated as BigInts).
 */
export declare class Double {
  constructor(inner: number)
  toString(): string
}

export declare class Duration {
  months: number
  days: number
  nanoseconds: number
  constructor(months: number, days: number, nanoseconds: number)
  /** Returns the string representation of the Duration. */
  toString(): string
}

/**
 * A float number.
 *
 * Due to the nature of numbers in JavaScript, it's hard to distinguish between integers and floats, so this type is used to represent
 * float numbers while any other JS number will be treated as an integer. (This is not the case for BigInts, which are always treated as BigInts).
 */
export declare class Float {
  constructor(inner: number)
  toString(): string
}

/** A list of any CqlType */
export declare class List<T = NativeTypes> {
  constructor(values: T[])
  toString(): string
}

/** A map of any CqlType to any CqlType */
export declare class Map<T = NativeTypes, U = NativeTypes> {
  constructor(values: Array<Array<T | U>>)
  toString(): string
}

export declare class Metrics {
  /** Returns counter for nonpaged queries */
  getQueriesNum(): bigint
  /** Returns counter for pages requested in paged queries */
  getQueriesIterNum(): bigint
  /** Returns counter for errors occurred in nonpaged queries */
  getErrorsNum(): bigint
  /** Returns counter for errors occurred in paged queries */
  getErrorsIterNum(): bigint
  /** Returns average latency in milliseconds */
  getLatencyAvgMs(): bigint
  /**
   * Returns latency from histogram for a given percentile
   *
   * # Arguments
   *
   * * `percentile` - float value (0.0 - 100.0), value will be clamped to this range
   */
  getLatencyPercentileMs(percentile: number): bigint
}

export declare class PreparedStatement {
  setConsistency(consistency: Consistency): void
  setSerialConsistency(serialConsistency: SerialConsistency): void
}

export declare class Query {
  constructor(query: string)
  setConsistency(consistency: Consistency): void
  setSerialConsistency(serialConsistency: SerialConsistency): void
  setPageSize(pageSize: number): void
}

export declare class ScyllaClusterData {
  /**
   * Access keyspaces details collected by the driver Driver collects various schema details like
   * tables, partitioners, columns, types. They can be read using this method
   */
  getKeyspaceInfo(): Record<string, ScyllaKeyspace> | null
}

export declare class ScyllaSession {
  metrics(): Metrics
  getClusterData(): Promise<ScyllaClusterData>
  executeWithTracing(query: string | Query | PreparedStatement, parameters?: Array<ParameterWithMapType> | undefined | null, options?: QueryOptions | undefined | null): Promise<TracingReturn>
  /**
   * Sends a query to the database and receives a response.\
   * Returns only a single page of results, to receive multiple pages use (TODO: Not implemented yet)
   *
   * This is the easiest way to make a query, but performance is worse than that of prepared queries.
   *
   * It is discouraged to use this method with non-empty values argument. In such case, query first needs to be prepared (on a single connection), so
   * driver will perform 2 round trips instead of 1. Please use `PreparedStatement` object or `{ prepared: true }` option instead.
   *
   * # Notes
   *
   * ## UDT
   * Order of fields in the object must match the order of fields as defined in the UDT. The
   * driver does not check it by itself, so incorrect data will be written if the order is
   * wrong.
   */
  execute(query: string | Query | PreparedStatement, parameters?: Array<ParameterWithMapType> | undefined | null, options?: QueryOptions | undefined | null): Promise<JSQueryResult>
  query(scyllaQuery: Query, parameters?: Array<ParameterWithMapType> | undefined | null): Promise<JSQueryResult>
  prepare(query: string): Promise<PreparedStatement>
  /**
   * Perform a batch query\
   * Batch contains many `simple` or `prepared` queries which are executed at once\
   * Batch doesn't return any rows
   *
   * Batch values must contain values for each of the queries
   *
   * See [the book](https://rust-driver.docs.scylladb.com/stable/queries/batch.html) for more information
   *
   * # Arguments
   * * `batch` - Batch to be performed
   * * `values` - List of values for each query, it's the easiest to use an array of arrays
   *
   * # Example
   * ```javascript
   * const nodes = process.env.CLUSTER_NODES?.split(",") ?? ["127.0.0.1:9042"];
   *
   * const cluster = new Cluster({ nodes });
   * const session = await cluster.connect();
   *
   * const batch = new BatchStatement();
   *
   * await session.execute("CREATE KEYSPACE IF NOT EXISTS batch_statements WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 }");
   * await session.useKeyspace("batch_statements");
   * await session.execute("CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY, name TEXT)");
   *
   * const simpleStatement = new Query("INSERT INTO users (id, name) VALUES (?, ?)");
   * const preparedStatement = await session.prepare("INSERT INTO users (id, name) VALUES (?, ?)");
   *
   * batch.appendStatement(simpleStatement);
   * batch.appendStatement(preparedStatement);
   *
   * await session.batch(batch, [[Uuid.randomV4(), "Alice"], [Uuid.randomV4(), "Bob"]]);
   *
   * console.log(await session.execute("SELECT * FROM users"));
   * ```
   */
  batch(batch: BatchStatement, parameters: Array<Array<ParameterWithMapType> | undefined | null>): Promise<JSQueryResult>
  /**
   * Sends `USE <keyspace_name>` request on all connections\
   * This allows to write `SELECT * FROM table` instead of `SELECT * FROM keyspace.table`\
   *
   * Note that even failed `useKeyspace` can change currently used keyspace - the request is sent on all connections and
   * can overwrite previously used keyspace.
   *
   * Call only one `useKeyspace` at a time.\
   * Trying to do two `useKeyspace` requests simultaneously with different names
   * can end with some connections using one keyspace and the rest using the other.
   *
   * # Arguments
   *
   * * `keyspaceName` - keyspace name to use,
   * keyspace names can have up to 48 alphanumeric characters and contain underscores
   * * `caseSensitive` - if set to true the generated query will put keyspace name in quotes
   *
   * # Errors
   *
   * * `InvalidArg` - if the keyspace name is invalid
   *
   * # Example
   *
   * ```javascript
   * import { Cluster } from ".";
   *
   * const cluster = new Cluster({
   *   nodes: ["127.0.0.1:9042"],
   * });
   *
   * const session = await cluster.connect();
   *
   * await session.useKeyspace("system_schema");
   *
   * const result = await session
   *   .execute("SELECT * FROM scylla_tables limit ?", [1])
   *   .catch(console.error);
   * ```
   */
  useKeyspace(keyspaceName: string, caseSensitive?: boolean | undefined | null): Promise<void>
  /**
   * session.awaitSchemaAgreement returns a Promise that can be awaited as long as schema is not in an agreement.
   * However, it won’t wait forever; ClusterConfig defines a timeout that limits the time of waiting. If the timeout elapses,
   * the return value is an error, otherwise it is the schema_version.
   *
   * # Returns
   *
   * * `Promise<Uuid>` - schema_version
   *
   * # Errors
   * * `GenericFailure` - if the timeout elapses
   *
   * # Example
   * ```javascript
   * import { Cluster } from ".";
   *
   * const cluster = new Cluster({ nodes: ["127.0.0.1:9042"] });
   * const session = await cluster.connect();
   *
   * const schemaVersion = await session.awaitSchemaAgreement().catch(console.error);
   * console.log(schemaVersion);
   *
   * const isAgreed = await session.checkSchemaAgreement().catch(console.error);
   * console.log(isAgreed);
   * ```
   */
  awaitSchemaAgreement(): Promise<Uuid>
  checkSchemaAgreement(): Promise<boolean>
}

/** A list of any CqlType */
export declare class Set<T = NativeTypes> {
  constructor(values: T[])
  toString(): string
}

export declare class Uuid {
  /** Generates a random UUID v4. */
  static randomV4(): Uuid
  /** Parses a UUID from a string. It may fail if the string is not a valid UUID. */
  static fromString(str: string): Uuid
  /** Returns the string representation of the UUID. */
  toString(): string
}

/**
 * Native CQL `varint` representation.
 *
 * Represented as two's-complement binary in big-endian order.
 *
 * This type is a raw representation in bytes. It's the default
 * implementation of `varint` type - independent of any
 * external crates and crate features.
 *
 * # DB data format
 * Notice that constructors don't perform any normalization
 * on the provided data. This means that underlying bytes may
 * contain leading zeros.
 *
 * Currently, Scylla and Cassandra support non-normalized `varint` values.
 * Bytes provided by the user via constructor are passed to DB as is.
 */
export declare class Varint {
  constructor(inner: Array<number>)
  toString(): string
}

export interface Auth {
  username: string
  password: string
}

export interface ClusterConfig {
  nodes: Array<string>
  compression?: Compression
  defaultExecutionProfile?: ExecutionProfile
  keyspace?: string
  auth?: Auth
  ssl?: Ssl
  /** The driver automatically awaits schema agreement after a schema-altering query is executed. Waiting for schema agreement more than necessary is never a bug, but might slow down applications which do a lot of schema changes (e.g. a migration). For instance, in case where somebody wishes to create a keyspace and then a lot of tables in it, it makes sense only to wait after creating a keyspace and after creating all the tables rather than after every query. */
  autoAwaitSchemaAgreement?: boolean
  /** If the schema is not agreed upon, the driver sleeps for a duration in seconds before checking it again. The default value is 0.2 (200 milliseconds) */
  schemaAgreementInterval?: number
}

export declare const enum Compression {
  None = 0,
  Lz4 = 1,
  Snappy = 2
}

export interface ConnectionOptions {
  keyspace?: string
  auth?: Auth
  ssl?: Ssl
}

export declare const enum Consistency {
  Any = 0,
  One = 1,
  Two = 2,
  Three = 3,
  Quorum = 4,
  All = 5,
  LocalQuorum = 6,
  EachQuorum = 7,
  LocalOne = 10,
  Serial = 8,
  LocalSerial = 9
}

export interface ExecutionProfile {
  consistency?: Consistency
  serialConsistency?: SerialConsistency
  requestTimeout?: number
}

export interface NetworkTopologyStrategy {
  datacenterRepfactors: Record<string, number>
}

export interface Other {
  name: string
  data: Record<string, string>
}

export interface QueryOptions {
  prepare?: boolean
}

export interface ScyllaKeyspace {
  strategy: ScyllaStrategy
  tables: Record<string, ScyllaTable>
  views: Record<string, ScyllaMaterializedView>
}

export interface ScyllaMaterializedView {
  viewMetadata: ScyllaTable
  baseTableName: string
}

export interface ScyllaStrategy {
  kind: string
  data?: SimpleStrategy | NetworkTopologyStrategy | Other
}

export interface ScyllaTable {
  columns: Array<string>
  partitionKey: Array<string>
  clusteringKey: Array<string>
  partitioner?: string
}

export declare const enum SerialConsistency {
  Serial = 8,
  LocalSerial = 9
}

export interface SimpleStrategy {
  replicationFactor: number
}

export interface Ssl {
  enabled: boolean
  caFilepath?: string
  privateKeyFilepath?: string
  truststoreFilepath?: string
  verifyMode?: VerifyMode
}

export declare const enum VerifyMode {
  None = 0,
  Peer = 1
}

type NativeTypes = number | string | Uuid | bigint | Duration | Decimal | Float | List;
type WithMapType = NativeTypes | Record<string, NativeTypes> | NativeTypes[];
type ParameterWithMapType = WithMapType;
type JSQueryResult = Record<string, WithMapType>[];
type TracingReturn = { result: JSQueryResult; tracing: TracingInfo };

export interface TracingInfo {
  client?: string; // IP address as a string
  command?: string;
  coordinator?: string; // IP address as a string
  duration?: number;
  parameters?: Record<string, string>;
  request?: string;
  /**
   * started_at is a timestamp - time since unix epoch
   */
  started_at?: string;
  events: TracingEvent[];
}

/**
 * A single event happening during a traced query
 */
export interface TracingEvent {
  event_id: string;
  activity?: string;
  source?: string; // IP address as a string
  source_elapsed?: number;
  thread?: string;
}
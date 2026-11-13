/**
 * Wrapper for association properties on models that reference each other.
 *
 * With `emitDecoratorMetadata`, a property typed directly as another model class makes
 * TypeScript emit an eager reference to that class. Between two ES modules that import
 * each other, that reference runs before the class is initialised and throws. Typing the
 * property through a generic alias makes TypeScript emit `Object` instead.
 */
export type Relation<T> = T;

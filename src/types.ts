type Result<T, E> =
  | {
      data: T;
      success: true;
    }
  | {
      error: E;
      success: false;
    };

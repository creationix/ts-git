export type Callback = (err?: Error, value?) => void;
export type Continuable = (cb: Callback) => void;

export default run;

function run(iterator: Iterator<Continuable>, callback?: Callback) {
  var data = null, yielded: boolean = false;
  var next = callback ? nextSafe : nextPlain;
  next();
  check();

  function nextSafe(err?: Error, item?) {
    var result: IteratorResult<any>;
    try {
      result = (err ? iterator.throw(err) : iterator.next(item));
      if (!result.done) {
        var cont: Continuable = result.value;
        if (cont) cont(resume());
        yielded = true;
        return;
      }
    }
    catch (err) {
      return callback(err);
    }
    return callback(null, result.value);
  }

  function nextPlain(err?: Error, item?) {
    var cont = (err ? iterator.throw(err) : iterator.next(item)).value;
    if (cont) cont(resume());
    yielded = true;
  }

  function resume() {
    var done = false;
    return function () {
      if (done) return;
      done = true;
      data = arguments;
      check();
    };
  }

  function check() {
    while (data && yielded) {
      var err = data[0];
      var item = data[1];
      data = null;
      yielded = false;
      next(err, item);
      yielded = true;
    }
  }

}

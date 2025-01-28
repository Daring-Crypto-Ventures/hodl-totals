// For Google Apps Script Library "QUnit" (version 4)
// Extensions beyond the basic QUnit API found only in the GAS Library, documentation copied from:
// https://script.google.com/macros/library/d/13agWuzcPH32W4JJvOqOEYqeNHGihS63P2V-a-Vxz-c9WPIzZYBvIhs3m/4?authuser=0

interface DoneCallbackObject {
    /**
     * The number of failed assertions
     */
    failed: number;

    /**
     * The number of passed assertions
     */
    passed: number;

    /**
     * The total number of assertions
     */
    total: number;

    /**
     * The time in milliseconds it took tests to run from start to finish.
     */
    runtime: number;
}

interface LogCallbackObject {
    /**
     * The boolean result of an assertion, true means passed, false means failed.
     */
    result: boolean;

    /**
     * One side of a comparision assertion. Can be undefined when ok() is used.
     */
    actual: Object;

    /**
     * One side of a comparision assertion. Can be undefined when ok() is used.
     */
    expected: Object;

    /**
     * A string description provided by the assertion.
     */
    message: string;

    /**
     * The associated stacktrace, either from an exception or pointing to the source
     * of the assertion. Depends on browser support for providing stacktraces, so can be
     * undefined.
     */
    source: string;
}

interface ModuleStartCallbackObject {
    /**
     * Name of the next module to run
     */
    name: string;
}

interface ModuleDoneCallbackObject {
    /**
     * Name of this module
     */
    name: string;

    /**
     * The number of failed assertions
     */
    failed: number;

    /**
     * The number of passed assertions
     */
    passed: number;

    /**
     * The total number of assertions
     */
    total: number;
}

interface TestDoneCallbackObject {
    /**
     * TName of the next test to run
     */
    name: string;

    /**
     * Name of the current module
     */
    module: string;

    /**
     * The number of failed assertions
     */
    failed: number;

    /**
     * The number of passed assertions
     */
    passed: number;

    /**
     * The total number of assertions
     */
    total: number;

    /**
     * The total runtime, including setup and teardown
     */
    duration: number;
}

interface TestStartCallbackObject {
    /**
     * Name of the next test to run
     */
    name: string;

    /**
     * Name of the current module
     */
    module: string;
}

interface URLConfigItem {
    id: string;
    label: string;
    tooltip: string;
}

interface LifecycleObject {
    /**
     * Runs before each test
     * @param assert
     * @deprecated
     */
    setup?: ((assert: QUnitAssert) => void) | undefined;

    /**
     * Runs after each test
     * @param assert
     * @deprecated
     */
    teardown?: ((assert: QUnitAssert) => void) | undefined;
    /**
     * Runs before each test
     * @param assert
     */
    beforeEach?: ((assert: QUnitAssert) => void) | undefined;
    /**
     * Runs after each test
     * @param assert
     */
    afterEach?: ((assert: QUnitAssert) => void) | undefined;

    /**
     * Any additional properties on the hooks object will be added to that context.
     */
    [property: string]: any;
}

interface QUnitAssert {
    /* ASSERT */
    assert: any;
    jsDump: any;

    /**
     * A deep recursive comparison assertion, working on primitive types, arrays, objects,
     * regular expressions, dates and functions.
     *
     * The deepEqual() assertion can be used just like equal() when comparing the value of
     * objects, such that { key: value } is equal to { key: value }. For non-scalar values,
     * identity will be disregarded by deepEqual.
     *
     * @param actual Object or Expression being tested
     * @param expected Known comparison value
     * @param message A short description of the assertion
     */
    deepEqual(actual: any, expected: any, message?: string): any;

    /**
     * A non-strict comparison assertion, roughly equivalent to JUnit assertEquals.
     *
     * The equal assertion uses the simple comparison operator (==) to compare the actual
     * and expected arguments. When they are equal, the assertion passes: any; otherwise, it fails.
     * When it fails, both actual and expected values are displayed in the test result,
     * in addition to a given message.
     *
     * @param actual Expression being tested
     * @param expected Known comparison value
     * @param message A short description of the assertion
     */
    equal(actual: any, expected: any, message?: string): any;

    /**
     * Specify how many assertions are expected to run within a test.
     *
     * To ensure that an explicit number of assertions are run within any test, use
     * expect( number ) to register an expected count. If the number of assertions
     * run does not match the expected count, the test will fail.
     *
     * @param amount Number of assertions in this test.
     */
    expect(amount: number): any;

    /**
     * An inverted deep recursive comparison assertion, working on primitive types,
     * arrays, objects, regular expressions, dates and functions.
     *
     * The notDeepEqual() assertion can be used just like equal() when comparing the
     * value of objects, such that { key: value } is equal to { key: value }. For non-scalar
     * values, identity will be disregarded by notDeepEqual.
     *
     * @param actual Object or Expression being tested
     * @param expected Known comparison value
     * @param message A short description of the assertion
     */
    notDeepEqual(actual: any, expected: any, message?: string): any;

    /**
     * A non-strict comparison assertion, checking for inequality.
     *
     * The notEqual assertion uses the simple inverted comparison operator (!=) to compare
     * the actual and expected arguments. When they aren't equal, the assertion passes: any;
     * otherwise, it fails. When it fails, both actual and expected values are displayed
     * in the test result, in addition to a given message.
     *
     * @param actual Expression being tested
     * @param expected Known comparison value
     * @param message A short description of the assertion
     */
    notEqual(actual: any, expected: any, message?: string): any;

    notPropEqual(actual: any, expected: any, message?: string): any;

    propEqual(actual: any, expected: any, message?: string): any;

    /**
     * A non-strict comparison assertion, checking for inequality.
     *
     * The notStrictEqual assertion uses the strict inverted comparison operator (!==)
     * to compare the actual and expected arguments. When they aren't equal, the assertion
     * passes: any; otherwise, it fails. When it fails, both actual and expected values are
     * displayed in the test result, in addition to a given message.
     *
     * @param actual Expression being tested
     * @param expected Known comparison value
     * @param message A short description of the assertion
     */
    notStrictEqual(actual: any, expected: any, message?: string): any;

    /**
     * A boolean assertion, equivalent to CommonJS’s assert.ok() and JUnit’s assertTrue().
     * Passes if the first argument is truthy.
     *
     * The most basic assertion in QUnit, ok() requires just one argument. If the argument
     * evaluates to true, the assertion passes; otherwise, it fails. If a second message
     * argument is provided, it will be displayed in place of the result.
     *
     * @param state Expression being tested
     * @param message A short description of the assertion
     */
    ok(state: any, message?: string): any;

    /**
     * A strict type and value comparison assertion.
     *
     * The strictEqual() assertion provides the most rigid comparison of type and value with
     * the strict equality operator (===)
     *
     * @param actual Expression being tested
     * @param expected Known comparison value
     * @param message A short description of the assertion
     */
    strictEqual(actual: any, expected: any, message?: string): any;

    /**
     * Assertion to test if a callback throws an exception when run.
     *
     * When testing code that is expected to throw an exception based on a specific set of
     * circumstances, use throws() to catch the error object for testing and comparison.
     *
     * @param block Function to execute
     * @param expected Error Object to compare
     * @param message A short description of the assertion
     */
    throws(block: () => any, expected: any, message?: string): any;

    /**
     * @param block Function to execute
     * @param message A short description of the assertion
     */
    throws(block: () => any, message?: string): any;

    /**
     * Alias of throws.
     *
     * In very few environments, like Closure Compiler, throws is considered a reserved word
     * and will cause an error. For that case, an alias is bundled called raises. It has the
     * same signature and behaviour, just a different name.
     *
     * @param block Function to execute
     * @param expected Error Object to compare
     * @param message A short description of the assertion
     */
    raises(block: () => any, expected: any, message?: string): any;

    /**
     * Alias of throws.
     *
     * In very few environments, like Closure Compiler, throws is considered a reserved word
     * and will cause an error. For that case, an alias is bundled called raises. It has the
     * same signature and behaviour, just a different name.
     *
     * @param block Function to execute
     * @param message A short description of the assertion
     */
    raises(block: () => any, message?: string): any;
}

interface QUnitStatic extends QUnitAssert {
    /* ASYNC CONTROL */

    /**
     * Start running tests again after the testrunner was stopped. See stop().
     *
     * When your async test has multiple exit points, call start() for the corresponding number of stop() increments.
     *
     * @param decrement Optional argument to merge multiple start() calls into one. Use with multiple corrsponding stop() calls.
     */
    start(decrement?: number): any;

    /**
     * Stop the testrunner to wait for async tests to run. Call start() to continue.
     *
     * When your async test has multiple exit points, call stop() with the increment argument, corresponding to the number of start() calls you need.
     *
     * On Blackberry 5.0, window.stop is a native read-only function. If you deal with that browser, use QUnit.stop() instead, which will work anywhere.
     *
     * @param decrement Optional argument to merge multiple stop() calls into one. Use with multiple corrsponding start() calls.
     */
    stop(increment?: number): any;

    /* CALLBACKS */

    /**
     * Register a callback to fire whenever the test suite begins.
     *
     * QUnit.begin() is called once before running any tests. (a better would've been QUnit.start,
     * but thats already in use elsewhere and can't be changed.)
     *
     * @param callback Callback to execute
     */
    begin(callback: () => any): any;

    /**
     * Register a callback to fire whenever the test suite ends.
     *
     * @param callback Callback to execute.
     */
    done(callback: (details: DoneCallbackObject) => any): any;

    /**
     * Register a callback to fire whenever an assertion completes.
     *
     * This is one of several callbacks QUnit provides. Its intended for integration scenarios like
     * PhantomJS or Jenkins. The properties of the details argument are listed below as options.
     *
     * @param callback Callback to execute.
     */
    log(callback: (details: LogCallbackObject) => any): any;

    /**
     * Register a callback to fire whenever a module ends.
     *
     * @param callback Callback to execute.
     */
    moduleDone(callback: (details: ModuleDoneCallbackObject) => any): any;

    /**
     * Register a callback to fire whenever a module begins.
     *
     * @param callback Callback to execute.
     */
    moduleStart(callback: (details: ModuleStartCallbackObject) => any): any;

    /**
     * Register a callback to fire whenever a test ends.
     *
     * @param callback Callback to execute.
     */
    testDone(callback: (details: TestDoneCallbackObject) => any): any;

    /**
     * Register a callback to fire whenever a test begins.
     *
     * @param callback Callback to execute.
     */
    testStart(callback: (details: TestStartCallbackObject) => any): any;

    /* TEST */

    /**
     * Add an asynchronous test to run. The test must include a call to start().
     *
     * For testing asynchronous code, asyncTest will automatically stop the test runner
     * and wait for your code to call start() to continue.
     *
     * @param name Title of unit being tested
     * @param expected Number of assertions in this test
     * @param test Function to close over assertions
     */
    asyncTest(name: string, expected: number, test: (assert: QUnitAssert) => any): any;

    /**
     * Specify how many assertions are expected to run within a test.
     *
     * To ensure that an explicit number of assertions are run within any test, use
     * expect( number ) to register an expected count. If the number of assertions
     * run does not match the expected count, the test will fail.
     *
     * @param amount Number of assertions in this test.
     * @deprecated since version 1.16
     */
    expect(amount: number): any;

    /**
     * Group related tests under a single label.
     *
     * All tests that occur after a call to module() will be grouped into that module.
     * The test names will all be preceded by the module name in the test results.
     * You can then use that module name to select tests to run.
     *
     * @param name Label for this group of tests
     * @param lifecycle Callbacks to run before and after each test
     */
    module(name: string, lifecycle?: LifecycleObject): any;

    /**
     * Add a test to run.
     *
     * When testing the most common, synchronous code, use test().
     * The assert argument to the callback contains all of QUnit's assertion methods.
     * If you are avoiding using any of QUnit's globals, you can use the assert
     * argument instead.
     *
     * @param title Title of unit being tested
     * @param expected Number of assertions in this test
     * @param test Function to close over assertions
     */
    test(title: string, expected: number, test: (assert: QUnitAssert) => any): any;

    /**
     * https://github.com/jquery/qunit/blob/master/qunit/qunit.js#L1568
     */
    equiv(a: any, b: any): any;

    /**
     * https://github.com/jquery/qunit/blob/master/qunit/qunit.js#L897
     */
    push(result: any, actual: any, expected: any, message: string): any;

    /**
     * https://github.com/jquery/qunit/blob/master/qunit/qunit.js#L839
     */
    reset(): any;
}

// Configuration object and function, unique to QUnitGAS
interface QUnitGASConfig {
    title: string;
    requireExpects?: boolean;
    hidepassed?: boolean;
    cssUrl?: string;
}

// Useful for testing internals of QUnitGAS itself
interface QUnitGASInternals {
    init: any;
    reset: any;
    registerLoggingCallback: any;
    push: any;
    pushFailure: any;
    extend: any;
    is: any;
    objectType: any;
    url: any;
    id: any;
    addEvent: any;
    triggerEvent: any;
    assert: any;
    ok: any;
    equal: any;
    notEqual: any;
    deepEqual: any;
    notDeepEqual: any;
    strictEqual: any;
    notStrictEqual: any;
    propEqual: any;
    notPropEqual: any;
    throws: any;
    raises: any;
    equals: any;
    same: any;
    equiv: any;
    jsDump: any;
    diff: any;
    htmlCollection: any;
    internals: any;
}

interface QUnitGAS extends QUnitStatic {
    /** Configure QUnit for Google Apps Script. To just retrieve the configuration object, call this function without arguments.
     *
     * Example with one setting:
     * QUnit.config({ title: "Test suite for project X" });
     * Example with multiple settings:
     * QUnit.config({
     *   title: "Test suite for project X",
     *   requireExpects: true,
     *   hidepassed: true,
     *   cssUrl: "https://raw.github.com/jquery/qunit/master/qunit/qunit.css"
     * });
     *
     * Arguments:
     *   cfg	Object	Configation object to merge with the existing configuration.
     * Return Values:
     *   Object	The configuration object.
     */
    config(cfg: QUnitGASConfig): QUnitGASConfig;

    /** Extends the QUnit library or a given object with internal QUnit functions and objects. Useful for testing internals of QUnit itself.
     *
     * The following internal functions and objects are exposed: init, registerLoggingCallback, pushFailure, extend, is,
     * objectType, url, id, addEvent, triggerEvent, assert, same, equiv, jsDump, diff, htmlCollection, internals.
     *
     * Arguments:
     *   obj	Object	[Optional] The object to extend with QUnit internal functions and objects. If omitted, the QUnit library is extended.
     * Return Values:
     *   Object	The internal functions and objects that the QUnit library or the given object was extended with.
     */
    exposeInternals(obj: QUnitGASInternals): QUnitGASInternals;

    /** Register a callback to fired whenever a module ends.
     *
     * The callback is called with an object (with the properties: name, failed, passed, total) as argument whenever a module ends.
     *
     * Arguments:
     *   callback	Function	The callback function.
     */
    // moduleDone(callback: Function): void;

    /** Register a callback to fire whenever an assertion completes.
     *
     * The callback is called with an object (having the properties result, actual, expected, message) as argument whenever an assertion completes.
     *
     * Arguments:
     *   callback	Function	The callback function.
     */
    // log(callback: Function): void;

    /** Specify how many assertions are expected to run within a test.
     *
     * To ensure that an explicit number of assertions are run within any test, use expect( number ) to register an expected count.
     * If the number of assertions run does not match the expected count, the test will fail.
     *
     * Arguments:
     *   amount	Integer	Number of assertions in this test.
     */
    // expect(amount: number): void;

    /** Register a callback to fired whenever a module begins.
     *
     * The callback is called with an object (having a name property) as the only argument.
     *
     * Arguments:
     *   callback	Function	The callback function.
     */
    // moduleStart(callback: Function): void;

    /** Register a callback to fired when the test suite ends.
     *
     * The callback is called with an object (having the properties: failed, passed, total, runtime) as argumentwhenever all the tests
     * have finished running. The object's properties are as follows:
     *   failed is the number of failures that occurred.
     *   total is the total number of assertions that occurred,
     *   passed the passing assertions.
     *   runtime is the time in milliseconds to run the tests from start to finish.
     *
     * Arguments:
     *    callback	Function	The callback function.
     */
    // done(callback: Function): void;

    /** Separate tests into modules.
     *
     * All tests that occur after a call to module() will be grouped into that module.
     * The test names will all be preceded by the module name in the test results.
     * You can then use that module name to select tests to run.
     *
     * Arguments:
     *   name	String	The name of the module.
     *   testEnvironment	Object
     */
    // module(name: string, testEnvironment: Object): void;

    /** Pass URL parameters to QUnit for Google Apps Script. To just retrieve the parameters, call this function without arguments.
     *
     * Example:
     * function doGet(e) {
     *   QUnit.urlParams(e.parameter);
     *   QUnit.load(myTests);
     *   return QUnit.getHtml();
     * }
     *
     * Arguments:
     *   params	Object	[Optional] URL parameters to set.
     * Return Values:
     *   Object	The URL parameters.
     */
    urlParams(params: Object): Object;

    /** Register a callback to fire whenever a test block ends.
     *
     * The callback is called with an object (with the properties: name, failed, passed, total) as the argument whenever a test block ends.
     *
     * Arguments:
     *   callback	Function	The callback function.
     */
    // testDone(callback: Function): void;

    /** Add a test to run. Tests added are queued and run one after the other.
     *
     * When testing the most common, synchronous code, use test().
     * The assert argument to the callback contains all of QUnit's assertion methods.
     * If you are avoiding using any of QUnit's globals,
     * you can use the assert argument instead.
     *
     * Example:
     * test("a test", function(assert) {
     *    assert.ok(true, "always fine");
     * });
     *
     * Arguments:
     *   title	String	Title of unit being tested.
     *   expected	Integer	[Optional] Number of assertions in this test.
     *   callback	Function( assert: QUnit.assert )	Function to close over assertions.
     */
    // test(title: string, expected: number, callback: Function): void;

    /** Get a reference to the QUnit object. Useful for testing QUnit itself, or extending other objects with its functionality.
     *
     * Return Values:
     *    Object	The QUnit object.
     */
    getObj(): QUnitGAS;

    /** Register a callback to fired whenever a test block begins.
     *
     * The callback is called with an object (having a name property) as the only argument.
     *
     * Arguments:
     *   callback	Function	The callback function.
     */
    // testStart(callback: Function): void;

    /** Start running tests again after the testrunner was stopped. See stop().
     *
     * When your async test has multiple exit points, call start() for the corresponding number of stop() increments.
     *
     * Arguments:
     *   decrement	Integer	[Optional] The semaphore decrement. 1 by default.
     */
    // start(decrement: number): void;

    /** Register a callback to fired without arguments when the test suite begins.
     *
     * Arguments:
     *   callback	Function	The callback function.
     */
    // begin(callback: Function): void;

    /** Load QUnit for Google Apps Script.
     *
     * If a begin callback has been registered, it is fired here.
     *
     * Arguments:
     *   tests	Function	[Optional] A function with tests to run.
     */
    load(tests: Function): void;

    /** Extend an object with the following QUnit helpers: ok, equal, notEqual, deepEqual,
     * notDeepEqual, strictEqual, notStrictEqual, throws, module, test, asyncTest, expect.
     *
     * Examples:
     *   QUnit.helpers(this); // QUnit helpers are now global
     *
     * Arguments:
     *   obj	Object	The object to extend with QUnit helpers.
     * Return Values:
     *   Object	The extended object.
     */
    helpers(obj: Object): Object;

    /** Retrieve test results as HTML.
     *
     * Example:
     * function doGet(e) {
     *   QUnit.urlParams(e.parameter);
     *   QUnit.run(myTests); // myTests is a function containing your tests
     *   return QUnit.getHtml();
     * }
     *
     * Return Values:
     *   HtmlOutput	A new HtmlOutput object.
     */
    getHtml(): Object;

    /** Stop the testrunner to wait for async tests to run. Call start() to continue.
     *
     * When your async test has multiple exit points, call stop() with the increment argument, corresponding to the number of start() calls you need.
     *
     * Arguments:
     *   increment	Integer	[Optional] Optional argument to merge multiple stop() calls into one. Use with multiple corresponding start() calls.
     */
    // stop(increment: number): void;

    /** Add an asynchronous test to run. The test must include a call to start().
     *
     * For testing asynchronous code, asyncTest will automatically stop the test runner and wait for your code to call start() to continue.
     *
     * Arguments:
     *   title	String	Title of unit being tested.
     *   expected	Integer	[Optional] Number of assertions in this test.
     *   callback	Function( assert: QUnit.assert )	Function to close over assertions.
     */
    // asyncTest(title: String, expected: Number, callback: Function): void;
}

/* QUNIT */
declare let QUnit: QUnitGAS;

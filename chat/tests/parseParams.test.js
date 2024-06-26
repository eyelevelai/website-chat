const { parseParams } = require('../eyelevel');

// Mock external functions
const getQueryVars = jest.fn();
const clearAll = jest.fn();
const loadEnv = jest.fn();
const shouldResetChat = jest.fn();

const dependencies = { getQueryVars, clearAll, loadEnv, shouldResetChat };

const qTests = [
  {query: 'eychannel', param: 'channel', window: 'eychannel'},
  {query: 'eyorigin', queryVal: 'linkedin', param: 'origin', window: 'eyorigin'},
  {query: 'eyalerts', param: 'alerts', window: 'alerts'},
  {query: 'alertSound', param: 'alertSound', window: 'eyAlertSound'},
  {query: 'eyattn', queryVal: true, param: 'attention', paramVal: false, window: 'eyattn'},
  {expectQ: true, expectP: false, query: 'eyorigin', queryVal: 'linkedin', param: 'attention', window: 'eyattn'},
  {expectP: 'undefined', query: 'eybubble', queryVal: true, param: 'bubble', paramVal: false, window: 'eybubble'},
  {expectP: 'undefined', expectQ: true, query: 'clearcache', queryVal: 'true', param: 'clearcache', paramVal: false, window: 'eyreset'},
  {query: 'email', param: 'email', window: 'eyemail'},
  {query: 'embed', param: 'embed', window: 'eyembed'},
  {query: 'eyenv', param: 'env', window: 'eyEnv'},
  {query: 'eyid', param: 'eyid', window: 'eyid'},
  {query: 'eyfeedback', param: 'feedback', window: 'eyfeedback'},
  {query: 'fn', param: 'flowname', window: 'eyflowname'},
  {expectP: true, expectQ: true, query: 'fn', param: 'flowname', window: 'eyfnset'},
  {expectP: 'undefined', query: 'eyforcereset', queryVal: true, param: 'forceReset', paramVal: false, window: 'eyreset'},
  {query: 'fullName', param: 'fullName', window: 'eyname'},
  {param: 'gaid', window: 'gaid'},
  {expectP: 'undefined', query: 'eyinvert', queryVal: true, param: 'invert', paramVal: false, window: 'eyinvert'},
  {query: 'eymenu', param: 'menu', window: 'eymenu'},
  {query: 'modelId', queryVal: 1, param: 'modelId', paramVal: 2, window: 'modelId'},
  {query: 'eynoclose', queryVal: true, param: 'noclose', paramVal: false, window: 'eynoclose'},
  {query: 'phone', param: 'phone', window: 'eyphone'},
  {query: 'ref', param: 'ref', window: 'eyref'},
  {query: 'eyreset', queryVal: true, param: 'reset', paramVal: false, window: 'eyreset'},
  {expectP: 'undefined', query: 'resetSession', queryVal: true, param: 'resetSession', paramVal: false, window: 'eyresetsession'},
  {query: 'sources', param: 'sources', window: 'eysources'},
  {expectP: false, expectQ: true, query: 'eystate', queryVal: "open", param: 'state', window: 'eyshouldopen'},
  {query: 'un', param: 'username', window: 'eyusername'},
  {expectP: 'extra=testextra', param: 'extra', window: 'eyref'},
  {query: 'eyenv', window: 'eyEnv'},
];

const qsTests = [
  {query: 'eychannel', window: 'eychannel'},
  {query: 'eychannel', param: 'channel', window: 'eyorigin'},
  {query: 'eyorigin', queryVal: 'linkedin', param: 'origin', window: 'eyorigin'},
];

const rTests = [
  {expect: 'test1=test1val&test2=test2val', window: 'eyref', extras: [{key: 'test1', value: 'test1val'}, {key: 'test2', value: 'test2val'}]},
  {expect: '?shopId=t1&ok=t2&test1=test1val&test2=test2val', param: 'ref', paramVal: '?shopId=t1&ok=t2', window: 'eyref', extras: [{key: 'test1', value: 'test1val'}, {key: 'test2', value: 'test2val'}]},
];


const queryIdx = [];
const querySpecialIdx = [];
const paramIdx = [];
const refIdx = [];

let queryTests = qTests
  .filter(dict => (
    dict?.query !== undefined && dict.query !== null &&
    dict?.window !== undefined && dict.window !== null
  ));
if (queryIdx.length > 0) {
  if (queryIdx[0] === -1) {
    queryTests = [];
  } else {
    queryTests = qTests.filter((_, index) => queryIdx.includes(index));
  }
}

let querySpecialTests = qsTests
  .filter(dict => (
    dict?.query !== undefined && dict.query !== null &&
    dict?.window !== undefined && dict.window !== null
  ));
if (querySpecialIdx.length > 0) {
  if (querySpecialIdx[0] === -1) {
    querySpecialTests = [];
  } else {
    querySpecialTests = qsTests.filter((_, index) => querySpecialIdx.includes(index));
  }
}

let paramTests = qTests
  .filter(dict => (
    dict?.param !== undefined && dict.param !== null &&
    dict?.window !== undefined && dict.window !== null
  ));
if (paramIdx.length > 0) {
  if (paramIdx[0] === -1) {
    paramTests = [];
  } else {
    paramTests = qTests.filter((_, index) => paramIdx.includes(index));
  }
}

let refTests = rTests
  .filter(dict => (
    dict?.expect !== undefined && dict.expect !== null &&
    dict?.window !== undefined && dict.window !== null
  ));
if (refIdx.length > 0) {
  if (refIdx[0] === -1) {
    refTests = [];
  } else {
    refTests = qTests.filter((_, index) => refIdx.includes(index));
  }
}

if (queryTests.length > 0) {
  describe('parseParams - queryVars', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      delete window.eychannel;
      delete window.eyorigin;
      delete window.alerts;
      delete window.eyAlertSound;
      delete window.eyattn;
      delete window.eybubble;
      delete window.cacheBust;
      delete window.eyemail;
      delete window.eyembed;
      delete window.eyEnv;
      delete window.eyid;
      delete window.eyfeedback;
      delete window.eyflowname;
      delete window.eyfnset;
      delete window.eyreset;
      delete window.eyname;
      delete window.gaid;
      delete window.eyinvert;
      delete window.eymenu;
      delete window.modelId;
      delete window.eynoclose;
      delete window.eyphone;
      delete window.eyref;
      delete window.eyresetsession;
      delete window.eysources;
      delete window.eyshouldopen;
      delete window.eyusername;
    });

    test.each(queryTests)('$query ', (dict) => {
      getQueryVars.mockImplementation((isIframe) => {
        const qv = {};
        queryTests.forEach((dict) => {
          if (dict.queryVal !== undefined && dict.queryVal !== null) {
            qv[dict.query] = dict.queryVal;
          } else {
            qv[dict.query] = 'query' + dict.query;
          }
        });
        return qv;
      });

      const params = {};

      let queryVal = 'query' + dict.query;
      if (dict.expectQ !== undefined && dict.expectQ !== null) {
        if (dict.expectQ === 'undefined') {
          queryVal = undefined;
        } else {
          queryVal = dict.expectQ;
        }
      } else if (dict.queryVal !== undefined && dict.queryVal !== null) {
        queryVal = dict.queryVal;
      }

      if (dict.paramVal !== undefined && dict.paramVal !== null) {
        params[dict.param] = dict.paramVal;
      } else if (dict.param) {
        params[dict.param] = 'test' + dict.param;
      }

      shouldResetChat.mockReturnValueOnce(queryVal);
      parseParams(params, dependencies);
      try {
        expect(window[dict.window]).toBe(queryVal);
      } catch (error) {
        throw new Error(`[${dict.query}] failed: expected window.${dict.window} to be ${queryVal}, but got ${window[dict.window]}`);
      }
    });
  });
}

if (querySpecialTests.length > 0) {
  describe('parseParams - queryVars - special', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      delete window.eychannel;
      delete window.eyorigin;
      delete window.alerts;
      delete window.eyAlertSound;
      delete window.eyattn;
      delete window.eybubble;
      delete window.cacheBust;
      delete window.eyemail;
      delete window.eyembed;
      delete window.eyEnv;
      delete window.eyid;
      delete window.eyfeedback;
      delete window.eyflowname;
      delete window.eyfnset;
      delete window.eyreset;
      delete window.eyname;
      delete window.gaid;
      delete window.eyinvert;
      delete window.eymenu;
      delete window.modelId;
      delete window.eynoclose;
      delete window.eyphone;
      delete window.eyref;
      delete window.eyresetsession;
      delete window.eysources;
      delete window.eyshouldopen;
      delete window.eyusername;
    });

    test.each(querySpecialTests)('$query ', (dict) => {
      const params = {};

      let queryVal = 'query' + dict.query;
      if (dict.expectQ !== undefined && dict.expectQ !== null) {
        if (dict.expectQ === 'undefined') {
          queryVal = undefined;
        } else {
          queryVal = dict.expectQ;
        }
      } else if (dict.queryVal !== undefined && dict.queryVal !== null) {
        queryVal = dict.queryVal;
      }

      getQueryVars.mockImplementation((isIframe) => {
        const qv = {};
        qv[dict.query] = queryVal;
        return qv;
      });

      if (dict.paramVal !== undefined && dict.paramVal !== null) {
        params[dict.param] = dict.paramVal;
      } else if (dict.param) {
        params[dict.param] = 'test' + dict.param;
      }

      shouldResetChat.mockReturnValueOnce(queryVal);
      parseParams(params, dependencies);
      try {
        expect(window[dict.window]).toBe(queryVal);
      } catch (error) {
        throw new Error(`[${dict.query}] failed: expected window.${dict.window} to be ${queryVal}, but got ${window[dict.window]}`);
      }
    });
  });
}

if (paramTests.length > 0) {
  describe('parseParams - params', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      getQueryVars.mockImplementation((key, isIframe) => {
        return {};
      });

      delete window.eychannel;
      delete window.eyorigin;
      delete window.alerts;
      delete window.eyAlertSound;
      delete window.eyattn;
      delete window.eybubble;
      delete window.cacheBust;
      delete window.eyemail;
      delete window.eyembed;
      delete window.eyEnv;
      delete window.eyid;
      delete window.eyfeedback;
      delete window.eyflowname;
      delete window.eyfnset;
      delete window.eyreset;
      delete window.eyname;
      delete window.gaid;
      delete window.eyinvert;
      delete window.eymenu;
      delete window.modelId;
      delete window.eynoclose;
      delete window.eyphone;
      delete window.eyref;
      delete window.eyresetsession;
      delete window.eysources;
      delete window.eyshouldopen;
      delete window.eyusername;
    });

    test.each(paramTests)('$param ', (dict) => {
      const params = {
        isIframe: false,
      };

      let paramVal = 'test' + dict.param;
      if (dict.expectP !== undefined && dict.expectP !== null) {
        if (dict.expectP === 'undefined') {
          paramVal = undefined;
        } else {
          paramVal = dict.expectP;
        }
      } else if (dict.paramVal !== undefined && dict.paramVal !== null) {
        paramVal = dict.paramVal;
      }

      if (dict.paramVal !== undefined && dict.paramVal !== null) {
        params[dict.param] = dict.paramVal;
      } else {
        params[dict.param] = 'test' + dict.param;
      }

      shouldResetChat.mockReturnValueOnce(paramVal);
      parseParams(params, dependencies);
      try {
        expect(window[dict.window]).toBe(paramVal);
      } catch (error) {
        throw new Error(`[${dict.param}] failed: expected window.${dict.window} to be ${paramVal}, but got ${window[dict.window]}`);
      }
    });
  });
}

if (refTests.length > 0) {
  describe('parseParams - refs', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      getQueryVars.mockImplementation((key, isIframe) => {
        return {};
      });

      delete window.eychannel;
      delete window.eyorigin;
      delete window.alerts;
      delete window.eyAlertSound;
      delete window.eyattn;
      delete window.eybubble;
      delete window.cacheBust;
      delete window.eyemail;
      delete window.eyembed;
      delete window.eyEnv;
      delete window.eyid;
      delete window.eyfeedback;
      delete window.eyflowname;
      delete window.eyfnset;
      delete window.eyreset;
      delete window.eyname;
      delete window.gaid;
      delete window.eyinvert;
      delete window.eymenu;
      delete window.modelId;
      delete window.eynoclose;
      delete window.eyphone;
      delete window.eyref;
      delete window.eyresetsession;
      delete window.eysources;
      delete window.eyshouldopen;
      delete window.eyusername;
    });

    test.each(refTests)('$expect ', (dict) => {
      const params = {
        isIframe: false,
      };

      dict.extras.forEach(val => {
        params[val.key] = val.value;
      });

      if (dict.param) {
        params[dict.param] = 'test' + dict.param;
        if (dict.paramVal) {
          params[dict.param] = dict.paramVal;
        }
      }

      parseParams(params, dependencies);
      try {
        expect(window[dict.window]).toBe(dict.expect);
      } catch (error) {
        throw new Error(`[${dict.expect}] failed: expected window.${dict.window} to be ${dict.expect}, but got ${window[dict.window]}`);
      }
    });
  });
}
/// <reference path="DefinitelyTyped/async/async.d.ts" />
/// <reference path="DefinitelyTyped/moment/moment-node.d.ts" />
/// <reference path="DefinitelyTyped/react/react.d.ts" />
/// <reference path="DefinitelyTyped/react-router/react-router.d.ts" />
/// <reference path="DefinitelyTyped/redux/redux.d.ts" />

// lazy
declare module "history" {
  var createHistory: any;
  var createHashHistory: any;
}
declare module "redux-router" {
  var reduxReactRouter: any;
  var routerStateReducer: any;
}

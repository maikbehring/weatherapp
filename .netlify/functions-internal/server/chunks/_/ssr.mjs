import { jsxDEV } from 'react/jsx-dev-runtime';
import { QueryClient, QueryClientProvider, dehydrate, hydrate, useQueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, HeadContent, Scripts, createFileRoute, lazyRouteComponent, RouterProvider, Outlet, createRouter as createRouter$1, ErrorComponent, useRouter } from '@tanstack/react-router';
import { jsx } from 'react/jsx-runtime';
import { useState, useEffect, Fragment } from 'react';
import { LayoutCard, Text, NotificationProvider, Alert, Heading, Content, Button } from '@mittwald/flow-remote-react-components';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CombinedWebhookHandlerFactory } from '@weissaufschwarz/mitthooks/index';
import { PrismaClient } from '@prisma/client';
import { fieldEncryptionExtension } from 'prisma-field-encryption';
import { str, url, cleanEnv } from 'envalid';
import { AsyncLocalStorage } from 'node:async_hooks';
import { defineHandlerCallback, renderRouterToStream } from '@tanstack/react-router/ssr/server';

function StartServer(props) {
  return /* @__PURE__ */ jsx(RouterProvider, { router: props.router });
}
const defaultStreamHandler = defineHandlerCallback(
  ({ request, router, responseHeaders }) => renderRouterToStream({
    request,
    router,
    responseHeaders,
    children: /* @__PURE__ */ jsx(StartServer, { router })
  })
);
const stateIndexKey = "__TSR_index";
function createHistory(opts) {
  let location = opts.getLocation();
  const subscribers = /* @__PURE__ */ new Set();
  const notify = (action) => {
    location = opts.getLocation();
    subscribers.forEach((subscriber) => subscriber({ location, action }));
  };
  const handleIndexChange = (action) => {
    if (opts.notifyOnIndexChange ?? true) notify(action);
    else location = opts.getLocation();
  };
  const tryNavigation = async ({
    task,
    navigateOpts,
    ...actionInfo
  }) => {
    var _a, _b;
    const ignoreBlocker = (navigateOpts == null ? void 0 : navigateOpts.ignoreBlocker) ?? false;
    if (ignoreBlocker) {
      task();
      return;
    }
    const blockers = ((_a = opts.getBlockers) == null ? void 0 : _a.call(opts)) ?? [];
    const isPushOrReplace = actionInfo.type === "PUSH" || actionInfo.type === "REPLACE";
    if (typeof document !== "undefined" && blockers.length && isPushOrReplace) {
      for (const blocker of blockers) {
        const nextLocation = parseHref(actionInfo.path, actionInfo.state);
        const isBlocked = await blocker.blockerFn({
          currentLocation: location,
          nextLocation,
          action: actionInfo.type
        });
        if (isBlocked) {
          (_b = opts.onBlocked) == null ? void 0 : _b.call(opts);
          return;
        }
      }
    }
    task();
  };
  return {
    get location() {
      return location;
    },
    get length() {
      return opts.getLength();
    },
    subscribers,
    subscribe: (cb) => {
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
    push: (path, state, navigateOpts) => {
      const currentIndex = location.state[stateIndexKey];
      state = assignKeyAndIndex(currentIndex + 1, state);
      tryNavigation({
        task: () => {
          opts.pushState(path, state);
          notify({ type: "PUSH" });
        },
        navigateOpts,
        type: "PUSH",
        path,
        state
      });
    },
    replace: (path, state, navigateOpts) => {
      const currentIndex = location.state[stateIndexKey];
      state = assignKeyAndIndex(currentIndex, state);
      tryNavigation({
        task: () => {
          opts.replaceState(path, state);
          notify({ type: "REPLACE" });
        },
        navigateOpts,
        type: "REPLACE",
        path,
        state
      });
    },
    go: (index, navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.go(index);
          handleIndexChange({ type: "GO", index });
        },
        navigateOpts,
        type: "GO"
      });
    },
    back: (navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.back((navigateOpts == null ? void 0 : navigateOpts.ignoreBlocker) ?? false);
          handleIndexChange({ type: "BACK" });
        },
        navigateOpts,
        type: "BACK"
      });
    },
    forward: (navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.forward((navigateOpts == null ? void 0 : navigateOpts.ignoreBlocker) ?? false);
          handleIndexChange({ type: "FORWARD" });
        },
        navigateOpts,
        type: "FORWARD"
      });
    },
    canGoBack: () => location.state[stateIndexKey] !== 0,
    createHref: (str2) => opts.createHref(str2),
    block: (blocker) => {
      var _a;
      if (!opts.setBlockers) return () => {
      };
      const blockers = ((_a = opts.getBlockers) == null ? void 0 : _a.call(opts)) ?? [];
      opts.setBlockers([...blockers, blocker]);
      return () => {
        var _a2, _b;
        const blockers2 = ((_a2 = opts.getBlockers) == null ? void 0 : _a2.call(opts)) ?? [];
        (_b = opts.setBlockers) == null ? void 0 : _b.call(opts, blockers2.filter((b) => b !== blocker));
      };
    },
    flush: () => {
      var _a;
      return (_a = opts.flush) == null ? void 0 : _a.call(opts);
    },
    destroy: () => {
      var _a;
      return (_a = opts.destroy) == null ? void 0 : _a.call(opts);
    },
    notify
  };
}
function assignKeyAndIndex(index, state) {
  if (!state) {
    state = {};
  }
  const key = createRandomKey();
  return {
    ...state,
    key,
    // TODO: Remove in v2 - use __TSR_key instead
    __TSR_key: key,
    [stateIndexKey]: index
  };
}
function createMemoryHistory(opts = {
  initialEntries: ["/"]
}) {
  const entries = opts.initialEntries;
  let index = opts.initialIndex ? Math.min(Math.max(opts.initialIndex, 0), entries.length - 1) : entries.length - 1;
  const states = entries.map(
    (_entry, index2) => assignKeyAndIndex(index2, void 0)
  );
  const getLocation = () => parseHref(entries[index], states[index]);
  return createHistory({
    getLocation,
    getLength: () => entries.length,
    pushState: (path, state) => {
      if (index < entries.length - 1) {
        entries.splice(index + 1);
        states.splice(index + 1);
      }
      states.push(state);
      entries.push(path);
      index = Math.max(entries.length - 1, 0);
    },
    replaceState: (path, state) => {
      states[index] = state;
      entries[index] = path;
    },
    back: () => {
      index = Math.max(index - 1, 0);
    },
    forward: () => {
      index = Math.min(index + 1, entries.length - 1);
    },
    go: (n) => {
      index = Math.min(Math.max(index + n, 0), entries.length - 1);
    },
    createHref: (path) => path
  });
}
function parseHref(href, state) {
  const hashIndex = href.indexOf("#");
  const searchIndex = href.indexOf("?");
  const addedKey = createRandomKey();
  return {
    href,
    pathname: href.substring(
      0,
      hashIndex > 0 ? searchIndex > 0 ? Math.min(hashIndex, searchIndex) : hashIndex : searchIndex > 0 ? searchIndex : href.length
    ),
    hash: hashIndex > -1 ? href.substring(hashIndex) : "",
    search: searchIndex > -1 ? href.slice(searchIndex, hashIndex === -1 ? void 0 : hashIndex) : "",
    state: state || { [stateIndexKey]: 0, key: addedKey, __TSR_key: addedKey }
  };
}
function createRandomKey() {
  return (Math.random() + 1).toString(36).substring(7);
}
function splitSetCookieString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitSetCookieString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start, cookiesString.length));
    }
  }
  return cookiesStrings;
}
function toHeadersInstance(init) {
  if (init instanceof Headers) {
    return new Headers(init);
  } else if (Array.isArray(init)) {
    return new Headers(init);
  } else if (typeof init === "object") {
    return new Headers(init);
  } else {
    return new Headers();
  }
}
function mergeHeaders(...headers) {
  return headers.reduce((acc, header) => {
    const headersInstance = toHeadersInstance(header);
    for (const [key, value] of headersInstance.entries()) {
      if (key === "set-cookie") {
        const splitCookies = splitSetCookieString(value);
        splitCookies.forEach((cookie) => acc.append("set-cookie", cookie));
      } else {
        acc.set(key, value);
      }
    }
    return acc;
  }, new Headers());
}
function json(payload, init) {
  return new Response(JSON.stringify(payload), {
    ...init,
    headers: mergeHeaders(
      { "content-type": "application/json" },
      init == null ? void 0 : init.headers
    )
  });
}
var prefix = "Invariant failed";
function invariant(condition, message) {
  if (condition) {
    return;
  }
  {
    throw new Error(prefix);
  }
}
function isPlainObject(o) {
  if (!hasObjectPrototype(o)) {
    return false;
  }
  const ctor = o.constructor;
  if (typeof ctor === "undefined") {
    return true;
  }
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }
  if (!prot.hasOwnProperty("isPrototypeOf")) {
    return false;
  }
  return true;
}
function hasObjectPrototype(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
function createControlledPromise(onResolve) {
  let resolveLoadPromise;
  let rejectLoadPromise;
  const controlledPromise = new Promise((resolve, reject) => {
    resolveLoadPromise = resolve;
    rejectLoadPromise = reject;
  });
  controlledPromise.status = "pending";
  controlledPromise.resolve = (value) => {
    controlledPromise.status = "resolved";
    controlledPromise.value = value;
    resolveLoadPromise(value);
  };
  controlledPromise.reject = (e) => {
    controlledPromise.status = "rejected";
    rejectLoadPromise(e);
  };
  return controlledPromise;
}
const SEGMENT_TYPE_PATHNAME = 0;
const SEGMENT_TYPE_PARAM = 1;
const SEGMENT_TYPE_WILDCARD = 2;
const SEGMENT_TYPE_OPTIONAL_PARAM = 3;
function joinPaths(paths) {
  return cleanPath(
    paths.filter((val) => {
      return val !== void 0;
    }).join("/")
  );
}
function cleanPath(path) {
  return path.replace(/\/{2,}/g, "/");
}
function trimPathLeft(path) {
  return path === "/" ? path : path.replace(/^\/{1,}/, "");
}
function trimPathRight(path) {
  return path === "/" ? path : path.replace(/\/{1,}$/, "");
}
function trimPath(path) {
  return trimPathRight(trimPathLeft(path));
}
const parsePathname = (pathname, cache) => {
  if (!pathname) return [];
  const cached = cache == null ? void 0 : cache.get(pathname);
  if (cached) return cached;
  const parsed = baseParsePathname(pathname);
  cache == null ? void 0 : cache.set(pathname, parsed);
  return parsed;
};
const PARAM_RE = /^\$.{1,}$/;
const PARAM_W_CURLY_BRACES_RE = /^(.*?)\{(\$[a-zA-Z_$][a-zA-Z0-9_$]*)\}(.*)$/;
const OPTIONAL_PARAM_W_CURLY_BRACES_RE = /^(.*?)\{-(\$[a-zA-Z_$][a-zA-Z0-9_$]*)\}(.*)$/;
const WILDCARD_RE = /^\$$/;
const WILDCARD_W_CURLY_BRACES_RE = /^(.*?)\{\$\}(.*)$/;
function baseParsePathname(pathname) {
  pathname = cleanPath(pathname);
  const segments = [];
  if (pathname.slice(0, 1) === "/") {
    pathname = pathname.substring(1);
    segments.push({
      type: SEGMENT_TYPE_PATHNAME,
      value: "/"
    });
  }
  if (!pathname) {
    return segments;
  }
  const split = pathname.split("/").filter(Boolean);
  segments.push(
    ...split.map((part) => {
      const partToMatch = part.slice(-1) === "_" ? part.slice(0, -1) : part;
      const wildcardBracesMatch = partToMatch.match(WILDCARD_W_CURLY_BRACES_RE);
      if (wildcardBracesMatch) {
        const prefix2 = wildcardBracesMatch[1];
        const suffix = wildcardBracesMatch[2];
        return {
          type: SEGMENT_TYPE_WILDCARD,
          value: "$",
          prefixSegment: prefix2 || void 0,
          suffixSegment: suffix || void 0
        };
      }
      const optionalParamBracesMatch = partToMatch.match(
        OPTIONAL_PARAM_W_CURLY_BRACES_RE
      );
      if (optionalParamBracesMatch) {
        const prefix2 = optionalParamBracesMatch[1];
        const paramName = optionalParamBracesMatch[2];
        const suffix = optionalParamBracesMatch[3];
        return {
          type: SEGMENT_TYPE_OPTIONAL_PARAM,
          value: paramName,
          // Now just $paramName (no prefix)
          prefixSegment: prefix2 || void 0,
          suffixSegment: suffix || void 0
        };
      }
      const paramBracesMatch = partToMatch.match(PARAM_W_CURLY_BRACES_RE);
      if (paramBracesMatch) {
        const prefix2 = paramBracesMatch[1];
        const paramName = paramBracesMatch[2];
        const suffix = paramBracesMatch[3];
        return {
          type: SEGMENT_TYPE_PARAM,
          value: "" + paramName,
          prefixSegment: prefix2 || void 0,
          suffixSegment: suffix || void 0
        };
      }
      if (PARAM_RE.test(partToMatch)) {
        const paramName = partToMatch.substring(1);
        return {
          type: SEGMENT_TYPE_PARAM,
          value: "$" + paramName,
          prefixSegment: void 0,
          suffixSegment: void 0
        };
      }
      if (WILDCARD_RE.test(partToMatch)) {
        return {
          type: SEGMENT_TYPE_WILDCARD,
          value: "$",
          prefixSegment: void 0,
          suffixSegment: void 0
        };
      }
      return {
        type: SEGMENT_TYPE_PATHNAME,
        value: partToMatch.includes("%25") ? partToMatch.split("%25").map((segment) => decodeURI(segment)).join("%25") : decodeURI(partToMatch)
      };
    })
  );
  if (pathname.slice(-1) === "/") {
    pathname = pathname.substring(1);
    segments.push({
      type: SEGMENT_TYPE_PATHNAME,
      value: "/"
    });
  }
  return segments;
}
function matchPathname(basepath, currentPathname, matchLocation, parseCache) {
  const pathParams = matchByPath(
    basepath,
    currentPathname,
    matchLocation,
    parseCache
  );
  if (matchLocation.to && !pathParams) {
    return;
  }
  return pathParams ?? {};
}
function removeBasepath(basepath, pathname, caseSensitive = false) {
  const normalizedBasepath = caseSensitive ? basepath : basepath.toLowerCase();
  const normalizedPathname = caseSensitive ? pathname : pathname.toLowerCase();
  switch (true) {
    // default behaviour is to serve app from the root - pathname
    // left untouched
    case normalizedBasepath === "/":
      return pathname;
    // shortcut for removing the basepath if it matches the pathname
    case normalizedPathname === normalizedBasepath:
      return "";
    // in case pathname is shorter than basepath - there is
    // nothing to remove
    case pathname.length < basepath.length:
      return pathname;
    // avoid matching partial segments - strict equality handled
    // earlier, otherwise, basepath separated from pathname with
    // separator, therefore lack of separator means partial
    // segment match (`/app` should not match `/application`)
    case normalizedPathname[normalizedBasepath.length] !== "/":
      return pathname;
    // remove the basepath from the pathname if it starts with it
    case normalizedPathname.startsWith(normalizedBasepath):
      return pathname.slice(basepath.length);
    // otherwise, return the pathname as is
    default:
      return pathname;
  }
}
function matchByPath(basepath, from, {
  to,
  fuzzy,
  caseSensitive
}, parseCache) {
  if (basepath !== "/" && !from.startsWith(basepath)) {
    return void 0;
  }
  from = removeBasepath(basepath, from, caseSensitive);
  to = removeBasepath(basepath, `${to ?? "$"}`, caseSensitive);
  const baseSegments = parsePathname(
    from.startsWith("/") ? from : `/${from}`,
    parseCache
  );
  const routeSegments = parsePathname(
    to.startsWith("/") ? to : `/${to}`,
    parseCache
  );
  const params = {};
  const result = isMatch(
    baseSegments,
    routeSegments,
    params,
    fuzzy,
    caseSensitive
  );
  return result ? params : void 0;
}
function isMatch(baseSegments, routeSegments, params, fuzzy, caseSensitive) {
  var _a, _b, _c;
  let baseIndex = 0;
  let routeIndex = 0;
  while (baseIndex < baseSegments.length || routeIndex < routeSegments.length) {
    const baseSegment = baseSegments[baseIndex];
    const routeSegment = routeSegments[routeIndex];
    if (routeSegment) {
      if (routeSegment.type === SEGMENT_TYPE_WILDCARD) {
        const remainingBaseSegments = baseSegments.slice(baseIndex);
        let _splat;
        if (routeSegment.prefixSegment || routeSegment.suffixSegment) {
          if (!baseSegment) return false;
          const prefix2 = routeSegment.prefixSegment || "";
          const suffix = routeSegment.suffixSegment || "";
          const baseValue = baseSegment.value;
          if ("prefixSegment" in routeSegment) {
            if (!baseValue.startsWith(prefix2)) {
              return false;
            }
          }
          if ("suffixSegment" in routeSegment) {
            if (!((_a = baseSegments[baseSegments.length - 1]) == null ? void 0 : _a.value.endsWith(suffix))) {
              return false;
            }
          }
          let rejoinedSplat = decodeURI(
            joinPaths(remainingBaseSegments.map((d) => d.value))
          );
          if (prefix2 && rejoinedSplat.startsWith(prefix2)) {
            rejoinedSplat = rejoinedSplat.slice(prefix2.length);
          }
          if (suffix && rejoinedSplat.endsWith(suffix)) {
            rejoinedSplat = rejoinedSplat.slice(
              0,
              rejoinedSplat.length - suffix.length
            );
          }
          _splat = rejoinedSplat;
        } else {
          _splat = decodeURI(
            joinPaths(remainingBaseSegments.map((d) => d.value))
          );
        }
        params["*"] = _splat;
        params["_splat"] = _splat;
        return true;
      }
      if (routeSegment.type === SEGMENT_TYPE_PATHNAME) {
        if (routeSegment.value === "/" && !(baseSegment == null ? void 0 : baseSegment.value)) {
          routeIndex++;
          continue;
        }
        if (baseSegment) {
          if (caseSensitive) {
            if (routeSegment.value !== baseSegment.value) {
              return false;
            }
          } else if (routeSegment.value.toLowerCase() !== baseSegment.value.toLowerCase()) {
            return false;
          }
          baseIndex++;
          routeIndex++;
          continue;
        } else {
          return false;
        }
      }
      if (routeSegment.type === SEGMENT_TYPE_PARAM) {
        if (!baseSegment) {
          return false;
        }
        if (baseSegment.value === "/") {
          return false;
        }
        let _paramValue = "";
        let matched = false;
        if (routeSegment.prefixSegment || routeSegment.suffixSegment) {
          const prefix2 = routeSegment.prefixSegment || "";
          const suffix = routeSegment.suffixSegment || "";
          const baseValue = baseSegment.value;
          if (prefix2 && !baseValue.startsWith(prefix2)) {
            return false;
          }
          if (suffix && !baseValue.endsWith(suffix)) {
            return false;
          }
          let paramValue = baseValue;
          if (prefix2 && paramValue.startsWith(prefix2)) {
            paramValue = paramValue.slice(prefix2.length);
          }
          if (suffix && paramValue.endsWith(suffix)) {
            paramValue = paramValue.slice(0, paramValue.length - suffix.length);
          }
          _paramValue = decodeURIComponent(paramValue);
          matched = true;
        } else {
          _paramValue = decodeURIComponent(baseSegment.value);
          matched = true;
        }
        if (matched) {
          params[routeSegment.value.substring(1)] = _paramValue;
          baseIndex++;
        }
        routeIndex++;
        continue;
      }
      if (routeSegment.type === SEGMENT_TYPE_OPTIONAL_PARAM) {
        if (!baseSegment) {
          routeIndex++;
          continue;
        }
        if (baseSegment.value === "/") {
          routeIndex++;
          continue;
        }
        let _paramValue = "";
        let matched = false;
        if (routeSegment.prefixSegment || routeSegment.suffixSegment) {
          const prefix2 = routeSegment.prefixSegment || "";
          const suffix = routeSegment.suffixSegment || "";
          const baseValue = baseSegment.value;
          if ((!prefix2 || baseValue.startsWith(prefix2)) && (!suffix || baseValue.endsWith(suffix))) {
            let paramValue = baseValue;
            if (prefix2 && paramValue.startsWith(prefix2)) {
              paramValue = paramValue.slice(prefix2.length);
            }
            if (suffix && paramValue.endsWith(suffix)) {
              paramValue = paramValue.slice(
                0,
                paramValue.length - suffix.length
              );
            }
            _paramValue = decodeURIComponent(paramValue);
            matched = true;
          }
        } else {
          let shouldMatchOptional = true;
          for (let lookAhead = routeIndex + 1; lookAhead < routeSegments.length; lookAhead++) {
            const futureRouteSegment = routeSegments[lookAhead];
            if ((futureRouteSegment == null ? void 0 : futureRouteSegment.type) === SEGMENT_TYPE_PATHNAME && futureRouteSegment.value === baseSegment.value) {
              shouldMatchOptional = false;
              break;
            }
            if ((futureRouteSegment == null ? void 0 : futureRouteSegment.type) === SEGMENT_TYPE_PARAM || (futureRouteSegment == null ? void 0 : futureRouteSegment.type) === SEGMENT_TYPE_WILDCARD) {
              if (baseSegments.length < routeSegments.length) {
                shouldMatchOptional = false;
              }
              break;
            }
          }
          if (shouldMatchOptional) {
            _paramValue = decodeURIComponent(baseSegment.value);
            matched = true;
          }
        }
        if (matched) {
          params[routeSegment.value.substring(1)] = _paramValue;
          baseIndex++;
        }
        routeIndex++;
        continue;
      }
    }
    if (baseIndex < baseSegments.length && routeIndex >= routeSegments.length) {
      params["**"] = joinPaths(
        baseSegments.slice(baseIndex).map((d) => d.value)
      );
      return ((_b = routeSegments[routeSegments.length - 1]) == null ? void 0 : _b.value) !== "/";
    }
    if (routeIndex < routeSegments.length && baseIndex >= baseSegments.length) {
      for (let i = routeIndex; i < routeSegments.length; i++) {
        if (((_c = routeSegments[i]) == null ? void 0 : _c.type) !== SEGMENT_TYPE_OPTIONAL_PARAM) {
          return false;
        }
      }
      break;
    }
    break;
  }
  return true;
}
const SLASH_SCORE = 0.75;
const STATIC_SEGMENT_SCORE = 1;
const REQUIRED_PARAM_BASE_SCORE = 0.5;
const OPTIONAL_PARAM_BASE_SCORE = 0.4;
const WILDCARD_PARAM_BASE_SCORE = 0.25;
const STATIC_AFTER_DYNAMIC_BONUS_SCORE = 0.2;
const BOTH_PRESENCE_BASE_SCORE = 0.05;
const PREFIX_PRESENCE_BASE_SCORE = 0.02;
const SUFFIX_PRESENCE_BASE_SCORE = 0.01;
const PREFIX_LENGTH_SCORE_MULTIPLIER = 2e-4;
const SUFFIX_LENGTH_SCORE_MULTIPLIER = 1e-4;
function handleParam(segment, baseScore) {
  if (segment.prefixSegment && segment.suffixSegment) {
    return baseScore + BOTH_PRESENCE_BASE_SCORE + PREFIX_LENGTH_SCORE_MULTIPLIER * segment.prefixSegment.length + SUFFIX_LENGTH_SCORE_MULTIPLIER * segment.suffixSegment.length;
  }
  if (segment.prefixSegment) {
    return baseScore + PREFIX_PRESENCE_BASE_SCORE + PREFIX_LENGTH_SCORE_MULTIPLIER * segment.prefixSegment.length;
  }
  if (segment.suffixSegment) {
    return baseScore + SUFFIX_PRESENCE_BASE_SCORE + SUFFIX_LENGTH_SCORE_MULTIPLIER * segment.suffixSegment.length;
  }
  return baseScore;
}
function sortRoutes(routes) {
  const scoredRoutes = [];
  routes.forEach((d, i) => {
    var _a;
    if (d.isRoot || !d.path) {
      return;
    }
    const trimmed = trimPathLeft(d.fullPath);
    let parsed = parsePathname(trimmed);
    let skip = 0;
    while (parsed.length > skip + 1 && ((_a = parsed[skip]) == null ? void 0 : _a.value) === "/") {
      skip++;
    }
    if (skip > 0) parsed = parsed.slice(skip);
    let optionalParamCount = 0;
    let hasStaticAfter = false;
    const scores = parsed.map((segment, index) => {
      if (segment.value === "/") {
        return SLASH_SCORE;
      }
      if (segment.type === SEGMENT_TYPE_PATHNAME) {
        return STATIC_SEGMENT_SCORE;
      }
      let baseScore = void 0;
      if (segment.type === SEGMENT_TYPE_PARAM) {
        baseScore = REQUIRED_PARAM_BASE_SCORE;
      } else if (segment.type === SEGMENT_TYPE_OPTIONAL_PARAM) {
        baseScore = OPTIONAL_PARAM_BASE_SCORE;
        optionalParamCount++;
      } else {
        baseScore = WILDCARD_PARAM_BASE_SCORE;
      }
      for (let i2 = index + 1; i2 < parsed.length; i2++) {
        const nextSegment = parsed[i2];
        if (nextSegment.type === SEGMENT_TYPE_PATHNAME && nextSegment.value !== "/") {
          hasStaticAfter = true;
          return handleParam(
            segment,
            baseScore + STATIC_AFTER_DYNAMIC_BONUS_SCORE
          );
        }
      }
      return handleParam(segment, baseScore);
    });
    scoredRoutes.push({
      child: d,
      trimmed,
      parsed,
      index: i,
      scores,
      optionalParamCount,
      hasStaticAfter
    });
  });
  const flatRoutes = scoredRoutes.sort((a, b) => {
    const minLength = Math.min(a.scores.length, b.scores.length);
    for (let i = 0; i < minLength; i++) {
      if (a.scores[i] !== b.scores[i]) {
        return b.scores[i] - a.scores[i];
      }
    }
    if (a.scores.length !== b.scores.length) {
      if (a.optionalParamCount !== b.optionalParamCount) {
        if (a.hasStaticAfter === b.hasStaticAfter) {
          return a.optionalParamCount - b.optionalParamCount;
        } else if (a.hasStaticAfter && !b.hasStaticAfter) {
          return -1;
        } else if (!a.hasStaticAfter && b.hasStaticAfter) {
          return 1;
        }
      }
      return b.scores.length - a.scores.length;
    }
    for (let i = 0; i < minLength; i++) {
      if (a.parsed[i].value !== b.parsed[i].value) {
        return a.parsed[i].value > b.parsed[i].value ? 1 : -1;
      }
    }
    return a.index - b.index;
  }).map((d, i) => {
    d.child.rank = i;
    return d.child;
  });
  return flatRoutes;
}
function processRouteTree({
  routeTree: routeTree2,
  initRoute
}) {
  const routesById = {};
  const routesByPath = {};
  const recurseRoutes = (childRoutes) => {
    childRoutes.forEach((childRoute, i) => {
      initRoute == null ? void 0 : initRoute(childRoute, i);
      const existingRoute = routesById[childRoute.id];
      invariant(
        !existingRoute,
        `Duplicate routes found with id: ${String(childRoute.id)}`
      );
      routesById[childRoute.id] = childRoute;
      if (!childRoute.isRoot && childRoute.path) {
        const trimmedFullPath = trimPathRight(childRoute.fullPath);
        if (!routesByPath[trimmedFullPath] || childRoute.fullPath.endsWith("/")) {
          routesByPath[trimmedFullPath] = childRoute;
        }
      }
      const children = childRoute.children;
      if (children == null ? void 0 : children.length) {
        recurseRoutes(children);
      }
    });
  };
  recurseRoutes([routeTree2]);
  const flatRoutes = sortRoutes(Object.values(routesById));
  return { routesById, routesByPath, flatRoutes };
}
function isNotFound(obj) {
  return !!(obj == null ? void 0 : obj.isNotFound);
}
const rootRouteId = "__root__";
function isRedirect(obj) {
  return obj instanceof Response && !!obj.options;
}
function isResolvedRedirect(obj) {
  return isRedirect(obj) && !!obj.options.href;
}
function getMatchedRoutes({
  pathname,
  routePathname,
  basepath,
  caseSensitive,
  routesByPath,
  routesById,
  flatRoutes,
  parseCache
}) {
  let routeParams = {};
  const trimmedPath = trimPathRight(pathname);
  const getMatchedParams = (route) => {
    var _a;
    const result = matchPathname(
      basepath,
      trimmedPath,
      {
        to: route.fullPath,
        caseSensitive: ((_a = route.options) == null ? void 0 : _a.caseSensitive) ?? caseSensitive,
        // we need fuzzy matching for `notFoundMode: 'fuzzy'`
        fuzzy: true
      },
      parseCache
    );
    return result;
  };
  let foundRoute = routePathname !== void 0 ? routesByPath[routePathname] : void 0;
  if (foundRoute) {
    routeParams = getMatchedParams(foundRoute);
  } else {
    let fuzzyMatch = void 0;
    for (const route of flatRoutes) {
      const matchedParams = getMatchedParams(route);
      if (matchedParams) {
        if (route.path !== "/" && matchedParams["**"]) {
          if (!fuzzyMatch) {
            fuzzyMatch = { foundRoute: route, routeParams: matchedParams };
          }
        } else {
          foundRoute = route;
          routeParams = matchedParams;
          break;
        }
      }
    }
    if (!foundRoute && fuzzyMatch) {
      foundRoute = fuzzyMatch.foundRoute;
      routeParams = fuzzyMatch.routeParams;
    }
  }
  let routeCursor = foundRoute || routesById[rootRouteId];
  const matchedRoutes = [routeCursor];
  while (routeCursor.parentRoute) {
    routeCursor = routeCursor.parentRoute;
    matchedRoutes.push(routeCursor);
  }
  matchedRoutes.reverse();
  return { matchedRoutes, routeParams, foundRoute };
}
const startSerializer = {
  stringify: (value) => JSON.stringify(value, function replacer(key, val) {
    const ogVal = this[key];
    const serializer = serializers.find((t) => t.stringifyCondition(ogVal));
    if (serializer) {
      return serializer.stringify(ogVal);
    }
    return val;
  }),
  parse: (value) => JSON.parse(value, function parser(key, val) {
    const ogVal = this[key];
    if (isPlainObject(ogVal)) {
      const serializer = serializers.find((t) => t.parseCondition(ogVal));
      if (serializer) {
        return serializer.parse(ogVal);
      }
    }
    return val;
  }),
  encode: (value) => {
    if (Array.isArray(value)) {
      return value.map((v) => startSerializer.encode(v));
    }
    if (isPlainObject(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([key, v]) => [
          key,
          startSerializer.encode(v)
        ])
      );
    }
    const serializer = serializers.find((t) => t.stringifyCondition(value));
    if (serializer) {
      return serializer.stringify(value);
    }
    return value;
  },
  decode: (value) => {
    if (isPlainObject(value)) {
      const serializer = serializers.find((t) => t.parseCondition(value));
      if (serializer) {
        return serializer.parse(value);
      }
    }
    if (Array.isArray(value)) {
      return value.map((v) => startSerializer.decode(v));
    }
    if (isPlainObject(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([key, v]) => [
          key,
          startSerializer.decode(v)
        ])
      );
    }
    return value;
  }
};
const createSerializer = (key, check, toValue, fromValue) => ({
  key,
  stringifyCondition: check,
  stringify: (value) => ({ [`$${key}`]: toValue(value) }),
  parseCondition: (value) => Object.hasOwn(value, `$${key}`),
  parse: (value) => fromValue(value[`$${key}`])
});
const serializers = [
  createSerializer(
    // Key
    "undefined",
    // Check
    (v) => v === void 0,
    // To
    () => 0,
    // From
    () => void 0
  ),
  createSerializer(
    // Key
    "date",
    // Check
    (v) => v instanceof Date,
    // To
    (v) => v.toISOString(),
    // From
    (v) => new Date(v)
  ),
  createSerializer(
    // Key
    "error",
    // Check
    (v) => v instanceof Error,
    // To
    (v) => ({
      ...v,
      message: v.message,
      stack: void 0,
      cause: v.cause
    }),
    // From
    (v) => Object.assign(new Error(v.message), v)
  ),
  createSerializer(
    // Key
    "formData",
    // Check
    (v) => v instanceof FormData,
    // To
    (v) => {
      const entries = {};
      v.forEach((value, key) => {
        const entry = entries[key];
        if (entry !== void 0) {
          if (Array.isArray(entry)) {
            entry.push(value);
          } else {
            entries[key] = [entry, value];
          }
        } else {
          entries[key] = value;
        }
      });
      return entries;
    },
    // From
    (v) => {
      const formData = new FormData();
      Object.entries(v).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((val) => formData.append(key, val));
        } else {
          formData.append(key, value);
        }
      });
      return formData;
    }
  ),
  createSerializer(
    // Key
    "bigint",
    // Check
    (v) => typeof v === "bigint",
    // To
    (v) => v.toString(),
    // From
    (v) => BigInt(v)
  ),
  createSerializer(
    // Key
    "server-function",
    // Check
    (v) => typeof v === "function" && "functionId" in v && typeof v.functionId === "string",
    // To
    ({ functionId }) => ({ functionId, __serverFn: true }),
    // From, dummy impl. the actual server function lookup is done on the server in packages/start-server-core/src/server-functions-handler.ts
    (v) => v
  )
];
function warning(condition, message) {
}
const startStorage = new AsyncLocalStorage();
async function runWithStartContext(context, fn) {
  return startStorage.run(context, fn);
}
function getStartContext(opts) {
  const context = startStorage.getStore();
  if (!context && (opts == null ? void 0 : opts.throwIfNotFound) !== false) {
    throw new Error(
      `No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`
    );
  }
  return context;
}
const globalMiddleware = [];
const getRouterInstance = () => {
  var _a;
  return (_a = getStartContext({
    throwIfNotFound: false
  })) == null ? void 0 : _a.router;
};
function createServerFn(options, __opts) {
  const resolvedOptions = __opts || options || {};
  if (typeof resolvedOptions.method === "undefined") {
    resolvedOptions.method = "GET";
  }
  return {
    options: resolvedOptions,
    middleware: (middleware) => {
      return createServerFn(void 0, Object.assign(resolvedOptions, {
        middleware
      }));
    },
    validator: (validator) => {
      return createServerFn(void 0, Object.assign(resolvedOptions, {
        validator
      }));
    },
    type: (type) => {
      return createServerFn(void 0, Object.assign(resolvedOptions, {
        type
      }));
    },
    handler: (...args) => {
      const [extractedFn, serverFn] = args;
      Object.assign(resolvedOptions, {
        ...extractedFn,
        extractedFn,
        serverFn
      });
      const resolvedMiddleware = [...resolvedOptions.middleware || [], serverFnBaseToMiddleware(resolvedOptions)];
      return Object.assign(async (opts) => {
        return executeMiddleware$1(resolvedMiddleware, "client", {
          ...extractedFn,
          ...resolvedOptions,
          data: opts == null ? void 0 : opts.data,
          headers: opts == null ? void 0 : opts.headers,
          signal: opts == null ? void 0 : opts.signal,
          context: {},
          router: getRouterInstance()
        }).then((d) => {
          if (resolvedOptions.response === "full") {
            return d;
          }
          if (d.error) throw d.error;
          return d.result;
        });
      }, {
        // This copies over the URL, function ID
        ...extractedFn,
        // The extracted function on the server-side calls
        // this function
        __executeServer: async (opts_, signal) => {
          const opts = opts_ instanceof FormData ? extractFormDataContext(opts_) : opts_;
          opts.type = typeof resolvedOptions.type === "function" ? resolvedOptions.type(opts) : resolvedOptions.type;
          const ctx = {
            ...extractedFn,
            ...opts,
            signal
          };
          const run = () => executeMiddleware$1(resolvedMiddleware, "server", ctx).then((d) => ({
            // Only send the result and sendContext back to the client
            result: d.result,
            error: d.error,
            context: d.sendContext
          }));
          if (ctx.type === "static") {
            let response;
            if (serverFnStaticCache == null ? void 0 : serverFnStaticCache.getItem) {
              response = await serverFnStaticCache.getItem(ctx);
            }
            if (!response) {
              response = await run().then((d) => {
                return {
                  ctx: d,
                  error: null
                };
              }).catch((e) => {
                return {
                  ctx: void 0,
                  error: e
                };
              });
              if (serverFnStaticCache == null ? void 0 : serverFnStaticCache.setItem) {
                await serverFnStaticCache.setItem(ctx, response);
              }
            }
            invariant(response);
            if (response.error) {
              throw response.error;
            }
            return response.ctx;
          }
          return run();
        }
      });
    }
  };
}
async function executeMiddleware$1(middlewares, env2, opts) {
  const flattenedMiddlewares = flattenMiddlewares([...globalMiddleware, ...middlewares]);
  const next = async (ctx) => {
    const nextMiddleware = flattenedMiddlewares.shift();
    if (!nextMiddleware) {
      return ctx;
    }
    if (nextMiddleware.options.validator && (env2 === "client" ? nextMiddleware.options.validateClient : true)) {
      ctx.data = await execValidator(nextMiddleware.options.validator, ctx.data);
    }
    const middlewareFn = env2 === "client" ? nextMiddleware.options.client : nextMiddleware.options.server;
    if (middlewareFn) {
      return applyMiddleware(middlewareFn, ctx, async (newCtx) => {
        return next(newCtx).catch((error) => {
          if (isRedirect(error) || isNotFound(error)) {
            return {
              ...newCtx,
              error
            };
          }
          throw error;
        });
      });
    }
    return next(ctx);
  };
  return next({
    ...opts,
    headers: opts.headers || {},
    sendContext: opts.sendContext || {},
    context: opts.context || {}
  });
}
let serverFnStaticCache;
function setServerFnStaticCache(cache) {
  const previousCache = serverFnStaticCache;
  serverFnStaticCache = typeof cache === "function" ? cache() : cache;
  return () => {
    serverFnStaticCache = previousCache;
  };
}
function createServerFnStaticCache(serverFnStaticCache2) {
  return serverFnStaticCache2;
}
async function sha1Hash(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
setServerFnStaticCache(() => {
  const getStaticCacheUrl = async (options, hash) => {
    const filename = await sha1Hash(`${options.functionId}__${hash}`);
    return `/__tsr/staticServerFnCache/${filename}.json`;
  };
  const jsonToFilenameSafeString = (json2) => {
    const sortedKeysReplacer = (key, value) => value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value).sort().reduce((acc, curr) => {
      acc[curr] = value[curr];
      return acc;
    }, {}) : value;
    const jsonString = JSON.stringify(json2 ?? "", sortedKeysReplacer);
    return jsonString.replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, "_");
  };
  const staticClientCache = typeof document !== "undefined" ? /* @__PURE__ */ new Map() : null;
  return createServerFnStaticCache({
    getItem: async (ctx) => {
      if (typeof document === "undefined") {
        const hash = jsonToFilenameSafeString(ctx.data);
        const url2 = await getStaticCacheUrl(ctx, hash);
        const publicUrl = "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/dist";
        const {
          promises: fs
        } = await import('node:fs');
        const path = await import('node:path');
        const filePath = path.join(publicUrl, url2);
        const [cachedResult, readError] = await fs.readFile(filePath, "utf-8").then((c) => [startSerializer.parse(c), null]).catch((e) => [null, e]);
        if (readError && readError.code !== "ENOENT") {
          throw readError;
        }
        return cachedResult;
      }
      return void 0;
    },
    setItem: async (ctx, response) => {
      const {
        promises: fs
      } = await import('node:fs');
      const path = await import('node:path');
      const hash = jsonToFilenameSafeString(ctx.data);
      const url2 = await getStaticCacheUrl(ctx, hash);
      const publicUrl = "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/dist";
      const filePath = path.join(publicUrl, url2);
      await fs.mkdir(path.dirname(filePath), {
        recursive: true
      });
      await fs.writeFile(filePath, startSerializer.stringify(response));
    },
    fetchItem: async (ctx) => {
      const hash = jsonToFilenameSafeString(ctx.data);
      const url2 = await getStaticCacheUrl(ctx, hash);
      let result = staticClientCache == null ? void 0 : staticClientCache.get(url2);
      if (!result) {
        result = await fetch(url2, {
          method: "GET"
        }).then((r) => r.text()).then((d) => startSerializer.parse(d));
        staticClientCache == null ? void 0 : staticClientCache.set(url2, result);
      }
      return result;
    }
  });
});
function extractFormDataContext(formData) {
  const serializedContext = formData.get("__TSR_CONTEXT");
  formData.delete("__TSR_CONTEXT");
  if (typeof serializedContext !== "string") {
    return {
      context: {},
      data: formData
    };
  }
  try {
    const context = startSerializer.parse(serializedContext);
    return {
      context,
      data: formData
    };
  } catch {
    return {
      data: formData
    };
  }
}
function flattenMiddlewares(middlewares) {
  const seen = /* @__PURE__ */ new Set();
  const flattened = [];
  const recurse = (middleware) => {
    middleware.forEach((m) => {
      if (m.options.middleware) {
        recurse(m.options.middleware);
      }
      if (!seen.has(m)) {
        seen.add(m);
        flattened.push(m);
      }
    });
  };
  recurse(middlewares);
  return flattened;
}
const applyMiddleware = async (middlewareFn, ctx, nextFn) => {
  return middlewareFn({
    ...ctx,
    next: async (userCtx = {}) => {
      return nextFn({
        ...ctx,
        ...userCtx,
        context: {
          ...ctx.context,
          ...userCtx.context
        },
        sendContext: {
          ...ctx.sendContext,
          ...userCtx.sendContext ?? {}
        },
        headers: mergeHeaders(ctx.headers, userCtx.headers),
        result: userCtx.result !== void 0 ? userCtx.result : ctx.response === "raw" ? userCtx : ctx.result,
        error: userCtx.error ?? ctx.error
      });
    }
  });
};
function execValidator(validator, input) {
  if (validator == null) return {};
  if ("~standard" in validator) {
    const result = validator["~standard"].validate(input);
    if (result instanceof Promise) throw new Error("Async validation not supported");
    if (result.issues) throw new Error(JSON.stringify(result.issues, void 0, 2));
    return result.value;
  }
  if ("parse" in validator) {
    return validator.parse(input);
  }
  if (typeof validator === "function") {
    return validator(input);
  }
  throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
  return {
    _types: void 0,
    options: {
      validator: options.validator,
      validateClient: options.validateClient,
      client: async ({
        next,
        sendContext,
        ...ctx
      }) => {
        var _a;
        const payload = {
          ...ctx,
          // switch the sendContext over to context
          context: sendContext,
          type: typeof ctx.type === "function" ? ctx.type(ctx) : ctx.type
        };
        if (ctx.type === "static" && "production" === "production" && typeof document !== "undefined") {
          invariant(serverFnStaticCache);
          const result = await serverFnStaticCache.fetchItem(payload);
          if (result) {
            if (result.error) {
              throw result.error;
            }
            return next(result.ctx);
          }
          warning(result, `No static cache item found for ${payload.functionId}__${JSON.stringify(payload.data)}, falling back to server function...`);
        }
        const res = await ((_a = options.extractedFn) == null ? void 0 : _a.call(options, payload));
        return next(res);
      },
      server: async ({
        next,
        ...ctx
      }) => {
        var _a;
        const result = await ((_a = options.serverFn) == null ? void 0 : _a.call(options, ctx));
        return next({
          ...ctx,
          result
        });
      }
    }
  };
}
var Feature = /* @__PURE__ */ ((Feature2) => {
  Feature2[Feature2["AggregateError"] = 1] = "AggregateError";
  Feature2[Feature2["ArrowFunction"] = 2] = "ArrowFunction";
  Feature2[Feature2["ErrorPrototypeStack"] = 4] = "ErrorPrototypeStack";
  Feature2[Feature2["ObjectAssign"] = 8] = "ObjectAssign";
  Feature2[Feature2["BigIntTypedArray"] = 16] = "BigIntTypedArray";
  return Feature2;
})(Feature || {});
var ALL_ENABLED = 1 | 2 | 4 | 8 | 16;
function serializeChar(str2) {
  switch (str2) {
    case '"':
      return '\\"';
    case "\\":
      return "\\\\";
    case "\n":
      return "\\n";
    case "\r":
      return "\\r";
    case "\b":
      return "\\b";
    case "	":
      return "\\t";
    case "\f":
      return "\\f";
    case "<":
      return "\\x3C";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return void 0;
  }
}
function serializeString(str2) {
  let result = "";
  let lastPos = 0;
  let replacement;
  for (let i = 0, len = str2.length; i < len; i++) {
    replacement = serializeChar(str2[i]);
    if (replacement) {
      result += str2.slice(lastPos, i) + replacement;
      lastPos = i + 1;
    }
  }
  if (lastPos === 0) {
    result = str2;
  } else {
    result += str2.slice(lastPos);
  }
  return result;
}
var REFERENCES_KEY = "__SEROVAL_REFS__";
var GLOBAL_CONTEXT_REFERENCES = "$R";
var GLOBAL_CONTEXT_R = `self.${GLOBAL_CONTEXT_REFERENCES}`;
function getCrossReferenceHeader(id) {
  return `(${GLOBAL_CONTEXT_R}=${GLOBAL_CONTEXT_R}||{})["${serializeString(
    id
  )}"]=[]`;
}
function assert(cond, error) {
  if (!cond) {
    throw error;
  }
}
var REFERENCE = /* @__PURE__ */ new Map();
var INV_REFERENCE = /* @__PURE__ */ new Map();
function hasReferenceID(value) {
  return REFERENCE.has(value);
}
function getReferenceID(value) {
  assert(hasReferenceID(value), new SerovalMissingReferenceError(value));
  return REFERENCE.get(value);
}
if (typeof globalThis !== "undefined") {
  Object.defineProperty(globalThis, REFERENCES_KEY, {
    value: INV_REFERENCE,
    configurable: true,
    writable: false,
    enumerable: false
  });
} else if (typeof self !== "undefined") {
  Object.defineProperty(self, REFERENCES_KEY, {
    value: INV_REFERENCE,
    configurable: true,
    writable: false,
    enumerable: false
  });
} else if (typeof global !== "undefined") {
  Object.defineProperty(global, REFERENCES_KEY, {
    value: INV_REFERENCE,
    configurable: true,
    writable: false,
    enumerable: false
  });
}
function createPlugin(plugin) {
  return plugin;
}
function dedupePlugins(deduped, plugins) {
  for (let i = 0, len = plugins.length; i < len; i++) {
    const current = plugins[i];
    if (!deduped.has(current)) {
      deduped.add(current);
      if (current.extends) {
        dedupePlugins(deduped, current.extends);
      }
    }
  }
}
function resolvePlugins(plugins) {
  if (plugins) {
    const deduped = /* @__PURE__ */ new Set();
    dedupePlugins(deduped, plugins);
    return [...deduped];
  }
  return void 0;
}
var SYMBOL_STRING = {
  [
    0
    /* AsyncIterator */
  ]: "Symbol.asyncIterator",
  [
    1
    /* HasInstance */
  ]: "Symbol.hasInstance",
  [
    2
    /* IsConcatSpreadable */
  ]: "Symbol.isConcatSpreadable",
  [
    3
    /* Iterator */
  ]: "Symbol.iterator",
  [
    4
    /* Match */
  ]: "Symbol.match",
  [
    5
    /* MatchAll */
  ]: "Symbol.matchAll",
  [
    6
    /* Replace */
  ]: "Symbol.replace",
  [
    7
    /* Search */
  ]: "Symbol.search",
  [
    8
    /* Species */
  ]: "Symbol.species",
  [
    9
    /* Split */
  ]: "Symbol.split",
  [
    10
    /* ToPrimitive */
  ]: "Symbol.toPrimitive",
  [
    11
    /* ToStringTag */
  ]: "Symbol.toStringTag",
  [
    12
    /* Unscopables */
  ]: "Symbol.unscopables"
};
var INV_SYMBOL_REF = {
  [Symbol.asyncIterator]: 0,
  [Symbol.hasInstance]: 1,
  [Symbol.isConcatSpreadable]: 2,
  [Symbol.iterator]: 3,
  [Symbol.match]: 4,
  [Symbol.matchAll]: 5,
  [Symbol.replace]: 6,
  [Symbol.search]: 7,
  [Symbol.species]: 8,
  [Symbol.split]: 9,
  [Symbol.toPrimitive]: 10,
  [Symbol.toStringTag]: 11,
  [Symbol.unscopables]: 12
  /* Unscopables */
};
var CONSTANT_STRING = {
  [
    2
    /* True */
  ]: "!0",
  [
    3
    /* False */
  ]: "!1",
  [
    1
    /* Undefined */
  ]: "void 0",
  [
    0
    /* Null */
  ]: "null",
  [
    4
    /* NegZero */
  ]: "-0",
  [
    5
    /* Inf */
  ]: "1/0",
  [
    6
    /* NegInf */
  ]: "-1/0",
  [
    7
    /* Nan */
  ]: "0/0"
};
var ERROR_CONSTRUCTOR_STRING = {
  [
    0
    /* Error */
  ]: "Error",
  [
    1
    /* EvalError */
  ]: "EvalError",
  [
    2
    /* RangeError */
  ]: "RangeError",
  [
    3
    /* ReferenceError */
  ]: "ReferenceError",
  [
    4
    /* SyntaxError */
  ]: "SyntaxError",
  [
    5
    /* TypeError */
  ]: "TypeError",
  [
    6
    /* URIError */
  ]: "URIError"
};
var NIL = void 0;
function createSerovalNode(t, i, s, l, c, m, p, e, a, f, b, o) {
  return {
    t,
    i,
    s,
    l,
    c,
    m,
    p,
    e,
    a,
    f,
    b,
    o
  };
}
function createConstantNode(value) {
  return createSerovalNode(
    2,
    NIL,
    value,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL
  );
}
var TRUE_NODE = /* @__PURE__ */ createConstantNode(
  2
  /* True */
);
var FALSE_NODE = /* @__PURE__ */ createConstantNode(
  3
  /* False */
);
var UNDEFINED_NODE = /* @__PURE__ */ createConstantNode(
  1
  /* Undefined */
);
var NULL_NODE = /* @__PURE__ */ createConstantNode(
  0
  /* Null */
);
var NEG_ZERO_NODE = /* @__PURE__ */ createConstantNode(
  4
  /* NegZero */
);
var INFINITY_NODE = /* @__PURE__ */ createConstantNode(
  5
  /* Inf */
);
var NEG_INFINITY_NODE = /* @__PURE__ */ createConstantNode(
  6
  /* NegInf */
);
var NAN_NODE = /* @__PURE__ */ createConstantNode(
  7
  /* Nan */
);
function getErrorConstructor(error) {
  if (error instanceof EvalError) {
    return 1;
  }
  if (error instanceof RangeError) {
    return 2;
  }
  if (error instanceof ReferenceError) {
    return 3;
  }
  if (error instanceof SyntaxError) {
    return 4;
  }
  if (error instanceof TypeError) {
    return 5;
  }
  if (error instanceof URIError) {
    return 6;
  }
  return 0;
}
function getInitialErrorOptions(error) {
  const construct = ERROR_CONSTRUCTOR_STRING[getErrorConstructor(error)];
  if (error.name !== construct) {
    return { name: error.name };
  }
  if (error.constructor.name !== construct) {
    return { name: error.constructor.name };
  }
  return {};
}
function getErrorOptions(error, features) {
  let options = getInitialErrorOptions(error);
  const names = Object.getOwnPropertyNames(error);
  for (let i = 0, len = names.length, name; i < len; i++) {
    name = names[i];
    if (name !== "name" && name !== "message") {
      if (name === "stack") {
        if (features & 4) {
          options = options || {};
          options[name] = error[name];
        }
      } else {
        options = options || {};
        options[name] = error[name];
      }
    }
  }
  return options;
}
function getObjectFlag(obj) {
  if (Object.isFrozen(obj)) {
    return 3;
  }
  if (Object.isSealed(obj)) {
    return 2;
  }
  if (Object.isExtensible(obj)) {
    return 0;
  }
  return 1;
}
function createNumberNode(value) {
  switch (value) {
    case Number.POSITIVE_INFINITY:
      return INFINITY_NODE;
    case Number.NEGATIVE_INFINITY:
      return NEG_INFINITY_NODE;
  }
  if (value !== value) {
    return NAN_NODE;
  }
  if (Object.is(value, -0)) {
    return NEG_ZERO_NODE;
  }
  return createSerovalNode(
    0,
    NIL,
    value,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL
  );
}
function createStringNode(value) {
  return createSerovalNode(
    1,
    NIL,
    serializeString(value),
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL
  );
}
function createBigIntNode(current) {
  return createSerovalNode(
    3,
    NIL,
    "" + current,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL
  );
}
function createIndexedValueNode(id) {
  return createSerovalNode(
    4,
    id,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL
  );
}
function createDateNode(id, current) {
  const timestamp = current.valueOf();
  return createSerovalNode(
    5,
    id,
    timestamp !== timestamp ? "" : current.toISOString(),
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL
  );
}
function createRegExpNode(id, current) {
  return createSerovalNode(
    6,
    id,
    NIL,
    NIL,
    serializeString(current.source),
    current.flags,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL
  );
}
function createArrayBufferNode(id, current) {
  const bytes = new Uint8Array(current);
  const len = bytes.length;
  const values = new Array(len);
  for (let i = 0; i < len; i++) {
    values[i] = bytes[i];
  }
  return createSerovalNode(
    19,
    id,
    values,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL
  );
}
function createWKSymbolNode(id, current) {
  return createSerovalNode(
    17,
    id,
    INV_SYMBOL_REF[current],
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL
  );
}
function createReferenceNode(id, ref) {
  return createSerovalNode(
    18,
    id,
    serializeString(getReferenceID(ref)),
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL
  );
}
function createPluginNode(id, tag, value) {
  return createSerovalNode(
    25,
    id,
    value,
    NIL,
    serializeString(tag),
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL
  );
}
function createArrayNode(id, current, parsedItems) {
  return createSerovalNode(
    9,
    id,
    NIL,
    current.length,
    NIL,
    NIL,
    NIL,
    NIL,
    parsedItems,
    NIL,
    NIL,
    getObjectFlag(current)
  );
}
function createBoxedNode(id, boxed) {
  return createSerovalNode(
    21,
    id,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    boxed,
    NIL,
    NIL
  );
}
function createTypedArrayNode(id, current, buffer) {
  return createSerovalNode(
    15,
    id,
    NIL,
    current.length,
    current.constructor.name,
    NIL,
    NIL,
    NIL,
    NIL,
    buffer,
    current.byteOffset,
    NIL
  );
}
function createBigIntTypedArrayNode(id, current, buffer) {
  return createSerovalNode(
    16,
    id,
    NIL,
    current.length,
    current.constructor.name,
    NIL,
    NIL,
    NIL,
    NIL,
    buffer,
    current.byteOffset,
    NIL
  );
}
function createDataViewNode(id, current, buffer) {
  return createSerovalNode(
    20,
    id,
    NIL,
    current.byteLength,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    buffer,
    current.byteOffset,
    NIL
  );
}
function createErrorNode(id, current, options) {
  return createSerovalNode(
    13,
    id,
    getErrorConstructor(current),
    NIL,
    NIL,
    serializeString(current.message),
    options,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL
  );
}
function createAggregateErrorNode(id, current, options) {
  return createSerovalNode(
    14,
    id,
    getErrorConstructor(current),
    NIL,
    NIL,
    serializeString(current.message),
    options,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL
  );
}
function createSetNode(id, size, items) {
  return createSerovalNode(
    7,
    id,
    NIL,
    size,
    NIL,
    NIL,
    NIL,
    NIL,
    items,
    NIL,
    NIL,
    NIL
  );
}
function createIteratorFactoryInstanceNode(factory, items) {
  return createSerovalNode(
    28,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    [factory, items],
    NIL,
    NIL,
    NIL
  );
}
function createAsyncIteratorFactoryInstanceNode(factory, items) {
  return createSerovalNode(
    30,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    [factory, items],
    NIL,
    NIL,
    NIL
  );
}
function createStreamConstructorNode(id, factory, sequence) {
  return createSerovalNode(
    31,
    id,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    sequence,
    factory,
    NIL,
    NIL
  );
}
function createStreamNextNode(id, parsed) {
  return createSerovalNode(
    32,
    id,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    parsed,
    NIL,
    NIL
  );
}
function createStreamThrowNode(id, parsed) {
  return createSerovalNode(
    33,
    id,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    parsed,
    NIL,
    NIL
  );
}
function createStreamReturnNode(id, parsed) {
  return createSerovalNode(
    34,
    id,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    NIL,
    parsed,
    NIL,
    NIL
  );
}
var { toString: objectToString } = Object.prototype;
function getErrorMessage(type, cause) {
  if (cause instanceof Error) {
    return `Seroval caught an error during the ${type} process.
  
${cause.name}
${cause.message}

- For more information, please check the "cause" property of this error.
- If you believe this is an error in Seroval, please submit an issue at https://github.com/lxsmnsyc/seroval/issues/new`;
  }
  return `Seroval caught an error during the ${type} process.

"${objectToString.call(cause)}"

For more information, please check the "cause" property of this error.`;
}
var SerovalError = class extends Error {
  constructor(type, cause) {
    super(getErrorMessage(type, cause));
    this.cause = cause;
  }
};
var SerovalParserError = class extends SerovalError {
  constructor(cause) {
    super("parsing", cause);
  }
};
var SerovalSerializationError = class extends SerovalError {
  constructor(cause) {
    super("serialization", cause);
  }
};
var SerovalUnsupportedTypeError = class extends Error {
  constructor(value) {
    super(
      `The value ${objectToString.call(value)} of type "${typeof value}" cannot be parsed/serialized.
      
There are few workarounds for this problem:
- Transform the value in a way that it can be serialized.
- If the reference is present on multiple runtimes (isomorphic), you can use the Reference API to map the references.`
    );
    this.value = value;
  }
};
var SerovalUnsupportedNodeError = class extends Error {
  constructor(node) {
    super('Unsupported node type "' + node.t + '".');
  }
};
var SerovalMissingPluginError = class extends Error {
  constructor(tag) {
    super('Missing plugin for tag "' + tag + '".');
  }
};
var SerovalMissingReferenceError = class extends Error {
  constructor(value) {
    super(
      'Missing reference for the value "' + objectToString.call(value) + '" of type "' + typeof value + '"'
    );
    this.value = value;
  }
};
var OpaqueReference = class {
  constructor(value, replacement) {
    this.value = value;
    this.replacement = replacement;
  }
};
function createFunction(features, parameters, body) {
  if (features & 2) {
    const joined = parameters.length === 1 ? parameters[0] : "(" + parameters.join(",") + ")";
    return joined + "=>" + (body.startsWith("{") ? "(" + body + ")" : body);
  }
  return "function(" + parameters.join(",") + "){return " + body + "}";
}
function createEffectfulFunction(features, parameters, body) {
  if (features & 2) {
    const joined = parameters.length === 1 ? parameters[0] : "(" + parameters.join(",") + ")";
    return joined + "=>{" + body + "}";
  }
  return "function(" + parameters.join(",") + "){" + body + "}";
}
var ITERATOR = {};
var ASYNC_ITERATOR = {};
var SPECIAL_REFS = {
  [
    0
    /* MapSentinel */
  ]: {},
  [
    1
    /* PromiseConstructor */
  ]: {},
  [
    2
    /* PromiseSuccess */
  ]: {},
  [
    3
    /* PromiseFailure */
  ]: {},
  [
    4
    /* StreamConstructor */
  ]: {}
};
function serializePromiseConstructor(features) {
  return createFunction(
    features,
    ["r"],
    "(r.p=new Promise(" + createEffectfulFunction(features, ["s", "f"], "r.s=s,r.f=f") + "))"
  );
}
function serializePromiseSuccess(features) {
  return createEffectfulFunction(
    features,
    ["r", "d"],
    "r.s(d),r.p.s=1,r.p.v=d"
  );
}
function serializePromiseFailure(features) {
  return createEffectfulFunction(
    features,
    ["r", "d"],
    "r.f(d),r.p.s=2,r.p.v=d"
  );
}
function serializeStreamConstructor(features) {
  return createFunction(
    features,
    ["b", "a", "s", "l", "p", "f", "e", "n"],
    "(b=[],a=!0,s=!1,l=[],p=0,f=" + createEffectfulFunction(
      features,
      ["v", "m", "x"],
      "for(x=0;x<p;x++)l[x]&&l[x][m](v)"
    ) + ",n=" + createEffectfulFunction(
      features,
      ["o", "x", "z", "c"],
      'for(x=0,z=b.length;x<z;x++)(c=b[x],(!a&&x===z-1)?o[s?"return":"throw"](c):o.next(c))'
    ) + ",e=" + createFunction(
      features,
      ["o", "t"],
      "(a&&(l[t=p++]=o),n(o)," + createEffectfulFunction(features, [], "a&&(l[t]=void 0)") + ")"
    ) + ",{__SEROVAL_STREAM__:!0,on:" + createFunction(features, ["o"], "e(o)") + ",next:" + createEffectfulFunction(features, ["v"], 'a&&(b.push(v),f(v,"next"))') + ",throw:" + createEffectfulFunction(
      features,
      ["v"],
      'a&&(b.push(v),f(v,"throw"),a=s=!1,l.length=0)'
    ) + ",return:" + createEffectfulFunction(
      features,
      ["v"],
      'a&&(b.push(v),f(v,"return"),a=!1,s=!0,l.length=0)'
    ) + "})"
  );
}
function serializeSpecialReferenceValue(features, ref) {
  switch (ref) {
    case 0:
      return "[]";
    case 1:
      return serializePromiseConstructor(features);
    case 2:
      return serializePromiseSuccess(features);
    case 3:
      return serializePromiseFailure(features);
    case 4:
      return serializeStreamConstructor(features);
    default:
      return "";
  }
}
function isStream(value) {
  return "__SEROVAL_STREAM__" in value;
}
function createStream() {
  const listeners = /* @__PURE__ */ new Set();
  const buffer = [];
  let alive = true;
  let success = true;
  function flushNext(value) {
    for (const listener of listeners.keys()) {
      listener.next(value);
    }
  }
  function flushThrow(value) {
    for (const listener of listeners.keys()) {
      listener.throw(value);
    }
  }
  function flushReturn(value) {
    for (const listener of listeners.keys()) {
      listener.return(value);
    }
  }
  return {
    __SEROVAL_STREAM__: true,
    on(listener) {
      if (alive) {
        listeners.add(listener);
      }
      for (let i = 0, len = buffer.length; i < len; i++) {
        const value = buffer[i];
        if (i === len - 1 && !alive) {
          if (success) {
            listener.return(value);
          } else {
            listener.throw(value);
          }
        } else {
          listener.next(value);
        }
      }
      return () => {
        if (alive) {
          listeners.delete(listener);
        }
      };
    },
    next(value) {
      if (alive) {
        buffer.push(value);
        flushNext(value);
      }
    },
    throw(value) {
      if (alive) {
        buffer.push(value);
        flushThrow(value);
        alive = false;
        success = false;
        listeners.clear();
      }
    },
    return(value) {
      if (alive) {
        buffer.push(value);
        flushReturn(value);
        alive = false;
        success = true;
        listeners.clear();
      }
    }
  };
}
function createStreamFromAsyncIterable(iterable) {
  const stream = createStream();
  const iterator = iterable[Symbol.asyncIterator]();
  async function push() {
    try {
      const value = await iterator.next();
      if (value.done) {
        stream.return(value.value);
      } else {
        stream.next(value.value);
        await push();
      }
    } catch (error) {
      stream.throw(error);
    }
  }
  push().catch(() => {
  });
  return stream;
}
function iteratorToSequence(source) {
  const values = [];
  let throwsAt = -1;
  let doneAt = -1;
  const iterator = source[Symbol.iterator]();
  while (true) {
    try {
      const value = iterator.next();
      values.push(value.value);
      if (value.done) {
        doneAt = values.length - 1;
        break;
      }
    } catch (error) {
      throwsAt = values.length;
      values.push(error);
    }
  }
  return {
    v: values,
    t: throwsAt,
    d: doneAt
  };
}
var BaseParserContext = class {
  constructor(options) {
    this.marked = /* @__PURE__ */ new Set();
    this.plugins = options.plugins;
    this.features = ALL_ENABLED ^ (options.disabledFeatures || 0);
    this.refs = options.refs || /* @__PURE__ */ new Map();
  }
  markRef(id) {
    this.marked.add(id);
  }
  isMarked(id) {
    return this.marked.has(id);
  }
  createIndex(current) {
    const id = this.refs.size;
    this.refs.set(current, id);
    return id;
  }
  getIndexedValue(current) {
    const registeredId = this.refs.get(current);
    if (registeredId != null) {
      this.markRef(registeredId);
      return {
        type: 1,
        value: createIndexedValueNode(registeredId)
      };
    }
    return {
      type: 0,
      value: this.createIndex(current)
    };
  }
  getReference(current) {
    const indexed = this.getIndexedValue(current);
    if (indexed.type === 1) {
      return indexed;
    }
    if (hasReferenceID(current)) {
      return {
        type: 2,
        value: createReferenceNode(indexed.value, current)
      };
    }
    return indexed;
  }
  parseWellKnownSymbol(current) {
    const ref = this.getReference(current);
    if (ref.type !== 0) {
      return ref.value;
    }
    assert(current in INV_SYMBOL_REF, new SerovalUnsupportedTypeError(current));
    return createWKSymbolNode(ref.value, current);
  }
  parseSpecialReference(ref) {
    const result = this.getIndexedValue(SPECIAL_REFS[ref]);
    if (result.type === 1) {
      return result.value;
    }
    return createSerovalNode(
      26,
      result.value,
      ref,
      NIL,
      NIL,
      NIL,
      NIL,
      NIL,
      NIL,
      NIL,
      NIL,
      NIL
    );
  }
  parseIteratorFactory() {
    const result = this.getIndexedValue(ITERATOR);
    if (result.type === 1) {
      return result.value;
    }
    return createSerovalNode(
      27,
      result.value,
      NIL,
      NIL,
      NIL,
      NIL,
      NIL,
      NIL,
      NIL,
      this.parseWellKnownSymbol(Symbol.iterator),
      NIL,
      NIL
    );
  }
  parseAsyncIteratorFactory() {
    const result = this.getIndexedValue(ASYNC_ITERATOR);
    if (result.type === 1) {
      return result.value;
    }
    return createSerovalNode(
      29,
      result.value,
      NIL,
      NIL,
      NIL,
      NIL,
      NIL,
      NIL,
      [
        this.parseSpecialReference(
          1
          /* PromiseConstructor */
        ),
        this.parseWellKnownSymbol(Symbol.asyncIterator)
      ],
      NIL,
      NIL,
      NIL
    );
  }
  createObjectNode(id, current, empty, record) {
    return createSerovalNode(
      empty ? 11 : 10,
      id,
      NIL,
      NIL,
      NIL,
      NIL,
      record,
      NIL,
      NIL,
      NIL,
      NIL,
      getObjectFlag(current)
    );
  }
  createMapNode(id, k, v, s) {
    return createSerovalNode(
      8,
      id,
      NIL,
      NIL,
      NIL,
      NIL,
      NIL,
      { k, v, s },
      NIL,
      this.parseSpecialReference(
        0
        /* MapSentinel */
      ),
      NIL,
      NIL
    );
  }
  createPromiseConstructorNode(id, resolver) {
    return createSerovalNode(
      22,
      id,
      resolver,
      NIL,
      NIL,
      NIL,
      NIL,
      NIL,
      NIL,
      this.parseSpecialReference(
        1
        /* PromiseConstructor */
      ),
      NIL,
      NIL
    );
  }
};
var IDENTIFIER_CHECK = /^[$A-Z_][0-9A-Z_$]*$/i;
function isValidIdentifier(name) {
  const char = name[0];
  return (char === "$" || char === "_" || char >= "A" && char <= "Z" || char >= "a" && char <= "z") && IDENTIFIER_CHECK.test(name);
}
function getAssignmentExpression(assignment) {
  switch (assignment.t) {
    case 0:
      return assignment.s + "=" + assignment.v;
    case 2:
      return assignment.s + ".set(" + assignment.k + "," + assignment.v + ")";
    case 1:
      return assignment.s + ".add(" + assignment.v + ")";
    case 3:
      return assignment.s + ".delete(" + assignment.k + ")";
  }
}
function mergeAssignments(assignments) {
  const newAssignments = [];
  let current = assignments[0];
  for (let i = 1, len = assignments.length, item, prev = current; i < len; i++) {
    item = assignments[i];
    if (item.t === 0 && item.v === prev.v) {
      current = {
        t: 0,
        s: item.s,
        k: NIL,
        v: getAssignmentExpression(current)
      };
    } else if (item.t === 2 && item.s === prev.s) {
      current = {
        t: 2,
        s: getAssignmentExpression(current),
        k: item.k,
        v: item.v
      };
    } else if (item.t === 1 && item.s === prev.s) {
      current = {
        t: 1,
        s: getAssignmentExpression(current),
        k: NIL,
        v: item.v
      };
    } else if (item.t === 3 && item.s === prev.s) {
      current = {
        t: 3,
        s: getAssignmentExpression(current),
        k: item.k,
        v: NIL
      };
    } else {
      newAssignments.push(current);
      current = item;
    }
    prev = item;
  }
  newAssignments.push(current);
  return newAssignments;
}
function resolveAssignments(assignments) {
  if (assignments.length) {
    let result = "";
    const merged = mergeAssignments(assignments);
    for (let i = 0, len = merged.length; i < len; i++) {
      result += getAssignmentExpression(merged[i]) + ",";
    }
    return result;
  }
  return NIL;
}
var NULL_CONSTRUCTOR = "Object.create(null)";
var SET_CONSTRUCTOR = "new Set";
var MAP_CONSTRUCTOR = "new Map";
var PROMISE_RESOLVE = "Promise.resolve";
var PROMISE_REJECT = "Promise.reject";
var OBJECT_FLAG_CONSTRUCTOR = {
  [
    3
    /* Frozen */
  ]: "Object.freeze",
  [
    2
    /* Sealed */
  ]: "Object.seal",
  [
    1
    /* NonExtensible */
  ]: "Object.preventExtensions",
  [
    0
    /* None */
  ]: NIL
};
var BaseSerializerContext = class {
  constructor(options) {
    this.stack = [];
    this.flags = [];
    this.assignments = [];
    this.plugins = options.plugins;
    this.features = options.features;
    this.marked = new Set(options.markedRefs);
  }
  createFunction(parameters, body) {
    return createFunction(this.features, parameters, body);
  }
  createEffectfulFunction(parameters, body) {
    return createEffectfulFunction(this.features, parameters, body);
  }
  /**
   * A tiny function that tells if a reference
   * is to be accessed. This is a requirement for
   * deciding whether or not we should generate
   * an identifier for the object
   */
  markRef(id) {
    this.marked.add(id);
  }
  isMarked(id) {
    return this.marked.has(id);
  }
  pushObjectFlag(flag, id) {
    if (flag !== 0) {
      this.markRef(id);
      this.flags.push({
        type: flag,
        value: this.getRefParam(id)
      });
    }
  }
  resolveFlags() {
    let result = "";
    for (let i = 0, current = this.flags, len = current.length; i < len; i++) {
      const flag = current[i];
      result += OBJECT_FLAG_CONSTRUCTOR[flag.type] + "(" + flag.value + "),";
    }
    return result;
  }
  resolvePatches() {
    const assignments = resolveAssignments(this.assignments);
    const flags = this.resolveFlags();
    if (assignments) {
      if (flags) {
        return assignments + flags;
      }
      return assignments;
    }
    return flags;
  }
  /**
   * Generates the inlined assignment for the reference
   * This is different from the assignments array as this one
   * signifies creation rather than mutation
   */
  createAssignment(source, value) {
    this.assignments.push({
      t: 0,
      s: source,
      k: NIL,
      v: value
    });
  }
  createAddAssignment(ref, value) {
    this.assignments.push({
      t: 1,
      s: this.getRefParam(ref),
      k: NIL,
      v: value
    });
  }
  createSetAssignment(ref, key, value) {
    this.assignments.push({
      t: 2,
      s: this.getRefParam(ref),
      k: key,
      v: value
    });
  }
  createDeleteAssignment(ref, key) {
    this.assignments.push({
      t: 3,
      s: this.getRefParam(ref),
      k: key,
      v: NIL
    });
  }
  createArrayAssign(ref, index, value) {
    this.createAssignment(this.getRefParam(ref) + "[" + index + "]", value);
  }
  createObjectAssign(ref, key, value) {
    this.createAssignment(this.getRefParam(ref) + "." + key, value);
  }
  /**
   * Checks if the value is in the stack. Stack here is a reference
   * structure to know if a object is to be accessed in a TDZ.
   */
  isIndexedValueInStack(node) {
    return node.t === 4 && this.stack.includes(node.i);
  }
  serializeReference(node) {
    return this.assignIndexedValue(
      node.i,
      REFERENCES_KEY + '.get("' + node.s + '")'
    );
  }
  serializeArrayItem(id, item, index) {
    if (item) {
      if (this.isIndexedValueInStack(item)) {
        this.markRef(id);
        this.createArrayAssign(
          id,
          index,
          this.getRefParam(item.i)
        );
        return "";
      }
      return this.serialize(item);
    }
    return "";
  }
  serializeArray(node) {
    const id = node.i;
    if (node.l) {
      this.stack.push(id);
      const list = node.a;
      let values = this.serializeArrayItem(id, list[0], 0);
      let isHoley = values === "";
      for (let i = 1, len = node.l, item; i < len; i++) {
        item = this.serializeArrayItem(id, list[i], i);
        values += "," + item;
        isHoley = item === "";
      }
      this.stack.pop();
      this.pushObjectFlag(node.o, node.i);
      return this.assignIndexedValue(id, "[" + values + (isHoley ? ",]" : "]"));
    }
    return this.assignIndexedValue(id, "[]");
  }
  serializeProperty(source, key, val) {
    if (typeof key === "string") {
      const check = Number(key);
      const isIdentifier = (
        // Test if key is a valid positive number or JS identifier
        // so that we don't have to serialize the key and wrap with brackets
        check >= 0 && // It's also important to consider that if the key is
        // indeed numeric, we need to make sure that when
        // converted back into a string, it's still the same
        // to the original key. This allows us to differentiate
        // keys that has numeric formats but in a different
        // format, which can cause unintentional key declaration
        // Example: { 0x1: 1 } vs { '0x1': 1 }
        check.toString() === key || isValidIdentifier(key)
      );
      if (this.isIndexedValueInStack(val)) {
        const refParam = this.getRefParam(val.i);
        this.markRef(source.i);
        if (isIdentifier && check !== check) {
          this.createObjectAssign(source.i, key, refParam);
        } else {
          this.createArrayAssign(
            source.i,
            isIdentifier ? key : '"' + key + '"',
            refParam
          );
        }
        return "";
      }
      return (isIdentifier ? key : '"' + key + '"') + ":" + this.serialize(val);
    }
    return "[" + this.serialize(key) + "]:" + this.serialize(val);
  }
  serializeProperties(source, record) {
    const len = record.s;
    if (len) {
      const keys = record.k;
      const values = record.v;
      this.stack.push(source.i);
      let result = this.serializeProperty(source, keys[0], values[0]);
      for (let i = 1, item = result; i < len; i++) {
        item = this.serializeProperty(source, keys[i], values[i]);
        result += (item && result && ",") + item;
      }
      this.stack.pop();
      return "{" + result + "}";
    }
    return "{}";
  }
  serializeObject(node) {
    this.pushObjectFlag(node.o, node.i);
    return this.assignIndexedValue(
      node.i,
      this.serializeProperties(node, node.p)
    );
  }
  serializeWithObjectAssign(source, value, serialized) {
    const fields = this.serializeProperties(source, value);
    if (fields !== "{}") {
      return "Object.assign(" + serialized + "," + fields + ")";
    }
    return serialized;
  }
  serializeStringKeyAssignment(source, mainAssignments, key, value) {
    const serialized = this.serialize(value);
    const check = Number(key);
    const isIdentifier = (
      // Test if key is a valid positive number or JS identifier
      // so that we don't have to serialize the key and wrap with brackets
      check >= 0 && // It's also important to consider that if the key is
      // indeed numeric, we need to make sure that when
      // converted back into a string, it's still the same
      // to the original key. This allows us to differentiate
      // keys that has numeric formats but in a different
      // format, which can cause unintentional key declaration
      // Example: { 0x1: 1 } vs { '0x1': 1 }
      check.toString() === key || isValidIdentifier(key)
    );
    if (this.isIndexedValueInStack(value)) {
      if (isIdentifier && check !== check) {
        this.createObjectAssign(source.i, key, serialized);
      } else {
        this.createArrayAssign(
          source.i,
          isIdentifier ? key : '"' + key + '"',
          serialized
        );
      }
    } else {
      const parentAssignment = this.assignments;
      this.assignments = mainAssignments;
      if (isIdentifier && check !== check) {
        this.createObjectAssign(source.i, key, serialized);
      } else {
        this.createArrayAssign(
          source.i,
          isIdentifier ? key : '"' + key + '"',
          serialized
        );
      }
      this.assignments = parentAssignment;
    }
  }
  serializeAssignment(source, mainAssignments, key, value) {
    if (typeof key === "string") {
      this.serializeStringKeyAssignment(source, mainAssignments, key, value);
    } else {
      const parent = this.stack;
      this.stack = [];
      const serialized = this.serialize(value);
      this.stack = parent;
      const parentAssignment = this.assignments;
      this.assignments = mainAssignments;
      this.createArrayAssign(source.i, this.serialize(key), serialized);
      this.assignments = parentAssignment;
    }
  }
  serializeAssignments(source, node) {
    const len = node.s;
    if (len) {
      const mainAssignments = [];
      const keys = node.k;
      const values = node.v;
      this.stack.push(source.i);
      for (let i = 0; i < len; i++) {
        this.serializeAssignment(source, mainAssignments, keys[i], values[i]);
      }
      this.stack.pop();
      return resolveAssignments(mainAssignments);
    }
    return NIL;
  }
  serializeDictionary(node, init) {
    if (node.p) {
      if (this.features & 8) {
        init = this.serializeWithObjectAssign(node, node.p, init);
      } else {
        this.markRef(node.i);
        const assignments = this.serializeAssignments(node, node.p);
        if (assignments) {
          return "(" + this.assignIndexedValue(node.i, init) + "," + assignments + this.getRefParam(node.i) + ")";
        }
      }
    }
    return this.assignIndexedValue(node.i, init);
  }
  serializeNullConstructor(node) {
    this.pushObjectFlag(node.o, node.i);
    return this.serializeDictionary(node, NULL_CONSTRUCTOR);
  }
  serializeDate(node) {
    return this.assignIndexedValue(node.i, 'new Date("' + node.s + '")');
  }
  serializeRegExp(node) {
    return this.assignIndexedValue(node.i, "/" + node.c + "/" + node.m);
  }
  serializeSetItem(id, item) {
    if (this.isIndexedValueInStack(item)) {
      this.markRef(id);
      this.createAddAssignment(
        id,
        this.getRefParam(item.i)
      );
      return "";
    }
    return this.serialize(item);
  }
  serializeSet(node) {
    let serialized = SET_CONSTRUCTOR;
    const size = node.l;
    const id = node.i;
    if (size) {
      const items = node.a;
      this.stack.push(id);
      let result = this.serializeSetItem(id, items[0]);
      for (let i = 1, item = result; i < size; i++) {
        item = this.serializeSetItem(id, items[i]);
        result += (item && result && ",") + item;
      }
      this.stack.pop();
      if (result) {
        serialized += "([" + result + "])";
      }
    }
    return this.assignIndexedValue(id, serialized);
  }
  serializeMapEntry(id, key, val, sentinel) {
    if (this.isIndexedValueInStack(key)) {
      const keyRef = this.getRefParam(key.i);
      this.markRef(id);
      if (this.isIndexedValueInStack(val)) {
        const valueRef = this.getRefParam(val.i);
        this.createSetAssignment(id, keyRef, valueRef);
        return "";
      }
      if (val.t !== 4 && val.i != null && this.isMarked(val.i)) {
        const serialized = "(" + this.serialize(val) + ",[" + sentinel + "," + sentinel + "])";
        this.createSetAssignment(id, keyRef, this.getRefParam(val.i));
        this.createDeleteAssignment(id, sentinel);
        return serialized;
      }
      const parent = this.stack;
      this.stack = [];
      this.createSetAssignment(id, keyRef, this.serialize(val));
      this.stack = parent;
      return "";
    }
    if (this.isIndexedValueInStack(val)) {
      const valueRef = this.getRefParam(val.i);
      this.markRef(id);
      if (key.t !== 4 && key.i != null && this.isMarked(key.i)) {
        const serialized = "(" + this.serialize(key) + ",[" + sentinel + "," + sentinel + "])";
        this.createSetAssignment(id, this.getRefParam(key.i), valueRef);
        this.createDeleteAssignment(id, sentinel);
        return serialized;
      }
      const parent = this.stack;
      this.stack = [];
      this.createSetAssignment(id, this.serialize(key), valueRef);
      this.stack = parent;
      return "";
    }
    return "[" + this.serialize(key) + "," + this.serialize(val) + "]";
  }
  serializeMap(node) {
    let serialized = MAP_CONSTRUCTOR;
    const size = node.e.s;
    const id = node.i;
    const sentinel = node.f;
    const sentinelId = this.getRefParam(sentinel.i);
    if (size) {
      const keys = node.e.k;
      const vals = node.e.v;
      this.stack.push(id);
      let result = this.serializeMapEntry(id, keys[0], vals[0], sentinelId);
      for (let i = 1, item = result; i < size; i++) {
        item = this.serializeMapEntry(id, keys[i], vals[i], sentinelId);
        result += (item && result && ",") + item;
      }
      this.stack.pop();
      if (result) {
        serialized += "([" + result + "])";
      }
    }
    if (sentinel.t === 26) {
      this.markRef(sentinel.i);
      serialized = "(" + this.serialize(sentinel) + "," + serialized + ")";
    }
    return this.assignIndexedValue(id, serialized);
  }
  serializeArrayBuffer(node) {
    let result = "new Uint8Array(";
    const buffer = node.s;
    const len = buffer.length;
    if (len) {
      result += "[" + buffer[0];
      for (let i = 1; i < len; i++) {
        result += "," + buffer[i];
      }
      result += "]";
    }
    return this.assignIndexedValue(node.i, result + ").buffer");
  }
  serializeTypedArray(node) {
    return this.assignIndexedValue(
      node.i,
      "new " + node.c + "(" + this.serialize(node.f) + "," + node.b + "," + node.l + ")"
    );
  }
  serializeDataView(node) {
    return this.assignIndexedValue(
      node.i,
      "new DataView(" + this.serialize(node.f) + "," + node.b + "," + node.l + ")"
    );
  }
  serializeAggregateError(node) {
    const id = node.i;
    this.stack.push(id);
    const serialized = this.serializeDictionary(
      node,
      'new AggregateError([],"' + node.m + '")'
    );
    this.stack.pop();
    return serialized;
  }
  serializeError(node) {
    return this.serializeDictionary(
      node,
      "new " + ERROR_CONSTRUCTOR_STRING[node.s] + '("' + node.m + '")'
    );
  }
  serializePromise(node) {
    let serialized;
    const fulfilled = node.f;
    const id = node.i;
    const promiseConstructor = node.s ? PROMISE_RESOLVE : PROMISE_REJECT;
    if (this.isIndexedValueInStack(fulfilled)) {
      const ref = this.getRefParam(fulfilled.i);
      serialized = promiseConstructor + (node.s ? "().then(" + this.createFunction([], ref) + ")" : "().catch(" + this.createEffectfulFunction([], "throw " + ref) + ")");
    } else {
      this.stack.push(id);
      const result = this.serialize(fulfilled);
      this.stack.pop();
      serialized = promiseConstructor + "(" + result + ")";
    }
    return this.assignIndexedValue(id, serialized);
  }
  serializeWellKnownSymbol(node) {
    return this.assignIndexedValue(node.i, SYMBOL_STRING[node.s]);
  }
  serializeBoxed(node) {
    return this.assignIndexedValue(
      node.i,
      "Object(" + this.serialize(node.f) + ")"
    );
  }
  serializePlugin(node) {
    const currentPlugins = this.plugins;
    if (currentPlugins) {
      for (let i = 0, len = currentPlugins.length; i < len; i++) {
        const plugin = currentPlugins[i];
        if (plugin.tag === node.c) {
          return this.assignIndexedValue(
            node.i,
            plugin.serialize(node.s, this, {
              id: node.i
            })
          );
        }
      }
    }
    throw new SerovalMissingPluginError(node.c);
  }
  getConstructor(node) {
    const current = this.serialize(node);
    return current === this.getRefParam(node.i) ? current : "(" + current + ")";
  }
  serializePromiseConstructor(node) {
    const resolver = this.assignIndexedValue(node.s, "{p:0,s:0,f:0}");
    return this.assignIndexedValue(
      node.i,
      this.getConstructor(node.f) + "(" + resolver + ")"
    );
  }
  serializePromiseResolve(node) {
    return this.getConstructor(node.a[0]) + "(" + this.getRefParam(node.i) + "," + this.serialize(node.a[1]) + ")";
  }
  serializePromiseReject(node) {
    return this.getConstructor(node.a[0]) + "(" + this.getRefParam(node.i) + "," + this.serialize(node.a[1]) + ")";
  }
  serializeSpecialReference(node) {
    return this.assignIndexedValue(
      node.i,
      serializeSpecialReferenceValue(this.features, node.s)
    );
  }
  serializeIteratorFactory(node) {
    let result = "";
    let initialized = false;
    if (node.f.t !== 4) {
      this.markRef(node.f.i);
      result = "(" + this.serialize(node.f) + ",";
      initialized = true;
    }
    result += this.assignIndexedValue(
      node.i,
      this.createFunction(
        ["s"],
        this.createFunction(
          ["i", "c", "d", "t"],
          "(i=0,t={[" + this.getRefParam(node.f.i) + "]:" + this.createFunction([], "t") + ",next:" + this.createEffectfulFunction(
            [],
            "if(i>s.d)return{done:!0,value:void 0};if(d=s.v[c=i++],c===s.t)throw d;return{done:c===s.d,value:d}"
          ) + "})"
        )
      )
    );
    if (initialized) {
      result += ")";
    }
    return result;
  }
  serializeIteratorFactoryInstance(node) {
    return this.getConstructor(node.a[0]) + "(" + this.serialize(node.a[1]) + ")";
  }
  serializeAsyncIteratorFactory(node) {
    const promise = node.a[0];
    const symbol = node.a[1];
    let result = "";
    if (promise.t !== 4) {
      this.markRef(promise.i);
      result += "(" + this.serialize(promise);
    }
    if (symbol.t !== 4) {
      this.markRef(symbol.i);
      result += (result ? "," : "(") + this.serialize(symbol);
    }
    if (result) {
      result += ",";
    }
    const iterator = this.assignIndexedValue(
      node.i,
      this.createFunction(
        ["s"],
        this.createFunction(
          ["b", "c", "p", "d", "e", "t", "f"],
          /**
           * b = resolved values
           * c = b size
           * p = pending promises
           * d = index where the resolved value stops
           * e = if the last value is a throw
           * t = placeholder variable
           * f = finalize
           */
          "(b=[],c=0,p=[],d=-1,e=!1,f=" + this.createEffectfulFunction(
            ["i", "l"],
            "for(i=0,l=p.length;i<l;i++)p[i].s({done:!0,value:void 0})"
          ) + ",s.on({next:" + this.createEffectfulFunction(
            ["v", "t"],
            "if(t=p.shift())t.s({done:!1,value:v});b.push(v)"
          ) + ",throw:" + this.createEffectfulFunction(
            ["v", "t"],
            "if(t=p.shift())t.f(v);f(),d=b.length,e=!0,b.push(v)"
          ) + ",return:" + this.createEffectfulFunction(
            ["v", "t"],
            "if(t=p.shift())t.s({done:!0,value:v});f(),d=b.length,b.push(v)"
          ) + "}),t={[" + this.getRefParam(symbol.i) + "]:" + this.createFunction([], "t.p") + ",next:" + this.createEffectfulFunction(
            ["i", "t", "v"],
            "if(d===-1){return((i=c++)>=b.length)?(" + this.getRefParam(promise.i) + "(t={p:0,s:0,f:0}),p.push(t),t.p):{done:!1,value:b[i]}}if(c>d)return{done:!0,value:void 0};if(v=b[i=c++],i!==d)return{done:!1,value:v};if(e)throw v;return{done:!0,value:v}"
          ) + "})"
        )
      )
    );
    if (result) {
      return result + iterator + ")";
    }
    return iterator;
  }
  serializeAsyncIteratorFactoryInstance(node) {
    return this.getConstructor(node.a[0]) + "(" + this.serialize(node.a[1]) + ")";
  }
  serializeStreamConstructor(node) {
    const result = this.assignIndexedValue(
      node.i,
      this.getConstructor(node.f) + "()"
    );
    const len = node.a.length;
    if (len) {
      let values = this.serialize(node.a[0]);
      for (let i = 1; i < len; i++) {
        values += "," + this.serialize(node.a[i]);
      }
      return "(" + result + "," + values + "," + this.getRefParam(node.i) + ")";
    }
    return result;
  }
  serializeStreamNext(node) {
    return this.getRefParam(node.i) + ".next(" + this.serialize(node.f) + ")";
  }
  serializeStreamThrow(node) {
    return this.getRefParam(node.i) + ".throw(" + this.serialize(node.f) + ")";
  }
  serializeStreamReturn(node) {
    return this.getRefParam(node.i) + ".return(" + this.serialize(node.f) + ")";
  }
  serialize(node) {
    try {
      switch (node.t) {
        case 2:
          return CONSTANT_STRING[node.s];
        case 0:
          return "" + node.s;
        case 1:
          return '"' + node.s + '"';
        case 3:
          return node.s + "n";
        case 4:
          return this.getRefParam(node.i);
        case 18:
          return this.serializeReference(node);
        case 9:
          return this.serializeArray(node);
        case 10:
          return this.serializeObject(node);
        case 11:
          return this.serializeNullConstructor(node);
        case 5:
          return this.serializeDate(node);
        case 6:
          return this.serializeRegExp(node);
        case 7:
          return this.serializeSet(node);
        case 8:
          return this.serializeMap(node);
        case 19:
          return this.serializeArrayBuffer(node);
        case 16:
        case 15:
          return this.serializeTypedArray(node);
        case 20:
          return this.serializeDataView(node);
        case 14:
          return this.serializeAggregateError(node);
        case 13:
          return this.serializeError(node);
        case 12:
          return this.serializePromise(node);
        case 17:
          return this.serializeWellKnownSymbol(node);
        case 21:
          return this.serializeBoxed(node);
        case 22:
          return this.serializePromiseConstructor(node);
        case 23:
          return this.serializePromiseResolve(node);
        case 24:
          return this.serializePromiseReject(node);
        case 25:
          return this.serializePlugin(node);
        case 26:
          return this.serializeSpecialReference(node);
        case 27:
          return this.serializeIteratorFactory(node);
        case 28:
          return this.serializeIteratorFactoryInstance(node);
        case 29:
          return this.serializeAsyncIteratorFactory(node);
        case 30:
          return this.serializeAsyncIteratorFactoryInstance(node);
        case 31:
          return this.serializeStreamConstructor(node);
        case 32:
          return this.serializeStreamNext(node);
        case 33:
          return this.serializeStreamThrow(node);
        case 34:
          return this.serializeStreamReturn(node);
        default:
          throw new SerovalUnsupportedNodeError(node);
      }
    } catch (error) {
      throw new SerovalSerializationError(error);
    }
  }
};
var CrossSerializerContext = class extends BaseSerializerContext {
  constructor(options) {
    super(options);
    this.mode = "cross";
    this.scopeId = options.scopeId;
  }
  getRefParam(id) {
    return GLOBAL_CONTEXT_REFERENCES + "[" + id + "]";
  }
  assignIndexedValue(index, value) {
    return this.getRefParam(index) + "=" + value;
  }
  serializeTop(tree) {
    const result = this.serialize(tree);
    const id = tree.i;
    if (id == null) {
      return result;
    }
    const patches = this.resolvePatches();
    const ref = this.getRefParam(id);
    const params = this.scopeId == null ? "" : GLOBAL_CONTEXT_REFERENCES;
    const body = patches ? "(" + result + "," + patches + ref + ")" : result;
    if (params === "") {
      if (tree.t === 10 && !patches) {
        return "(" + body + ")";
      }
      return body;
    }
    const args = this.scopeId == null ? "()" : "(" + GLOBAL_CONTEXT_REFERENCES + '["' + serializeString(this.scopeId) + '"])';
    return "(" + this.createFunction([params], body) + ")" + args;
  }
};
var BaseSyncParserContext = class extends BaseParserContext {
  parseItems(current) {
    const nodes = [];
    for (let i = 0, len = current.length; i < len; i++) {
      if (i in current) {
        nodes[i] = this.parse(current[i]);
      }
    }
    return nodes;
  }
  parseArray(id, current) {
    return createArrayNode(id, current, this.parseItems(current));
  }
  parseProperties(properties) {
    const entries = Object.entries(properties);
    const keyNodes = [];
    const valueNodes = [];
    for (let i = 0, len = entries.length; i < len; i++) {
      keyNodes.push(serializeString(entries[i][0]));
      valueNodes.push(this.parse(entries[i][1]));
    }
    let symbol = Symbol.iterator;
    if (symbol in properties) {
      keyNodes.push(this.parseWellKnownSymbol(symbol));
      valueNodes.push(
        createIteratorFactoryInstanceNode(
          this.parseIteratorFactory(),
          this.parse(
            iteratorToSequence(properties)
          )
        )
      );
    }
    symbol = Symbol.asyncIterator;
    if (symbol in properties) {
      keyNodes.push(this.parseWellKnownSymbol(symbol));
      valueNodes.push(
        createAsyncIteratorFactoryInstanceNode(
          this.parseAsyncIteratorFactory(),
          this.parse(createStream())
        )
      );
    }
    symbol = Symbol.toStringTag;
    if (symbol in properties) {
      keyNodes.push(this.parseWellKnownSymbol(symbol));
      valueNodes.push(createStringNode(properties[symbol]));
    }
    symbol = Symbol.isConcatSpreadable;
    if (symbol in properties) {
      keyNodes.push(this.parseWellKnownSymbol(symbol));
      valueNodes.push(properties[symbol] ? TRUE_NODE : FALSE_NODE);
    }
    return {
      k: keyNodes,
      v: valueNodes,
      s: keyNodes.length
    };
  }
  parsePlainObject(id, current, empty) {
    return this.createObjectNode(
      id,
      current,
      empty,
      this.parseProperties(current)
    );
  }
  parseBoxed(id, current) {
    return createBoxedNode(id, this.parse(current.valueOf()));
  }
  parseTypedArray(id, current) {
    return createTypedArrayNode(id, current, this.parse(current.buffer));
  }
  parseBigIntTypedArray(id, current) {
    return createBigIntTypedArrayNode(id, current, this.parse(current.buffer));
  }
  parseDataView(id, current) {
    return createDataViewNode(id, current, this.parse(current.buffer));
  }
  parseError(id, current) {
    const options = getErrorOptions(current, this.features);
    return createErrorNode(
      id,
      current,
      options ? this.parseProperties(options) : NIL
    );
  }
  parseAggregateError(id, current) {
    const options = getErrorOptions(current, this.features);
    return createAggregateErrorNode(
      id,
      current,
      options ? this.parseProperties(options) : NIL
    );
  }
  parseMap(id, current) {
    const keyNodes = [];
    const valueNodes = [];
    for (const [key, value] of current.entries()) {
      keyNodes.push(this.parse(key));
      valueNodes.push(this.parse(value));
    }
    return this.createMapNode(id, keyNodes, valueNodes, current.size);
  }
  parseSet(id, current) {
    const items = [];
    for (const item of current.keys()) {
      items.push(this.parse(item));
    }
    return createSetNode(id, current.size, items);
  }
  parsePlugin(id, current) {
    const currentPlugins = this.plugins;
    if (currentPlugins) {
      for (let i = 0, len = currentPlugins.length; i < len; i++) {
        const plugin = currentPlugins[i];
        if (plugin.parse.sync && plugin.test(current)) {
          return createPluginNode(
            id,
            plugin.tag,
            plugin.parse.sync(current, this, {
              id
            })
          );
        }
      }
    }
    return void 0;
  }
  parseStream(id, _current) {
    return createStreamConstructorNode(
      id,
      this.parseSpecialReference(
        4
        /* StreamConstructor */
      ),
      []
    );
  }
  parsePromise(id, _current) {
    return this.createPromiseConstructorNode(id, this.createIndex({}));
  }
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: ehh
  parseObject(id, current) {
    if (Array.isArray(current)) {
      return this.parseArray(id, current);
    }
    if (isStream(current)) {
      return this.parseStream(id, current);
    }
    const currentClass = current.constructor;
    if (currentClass === OpaqueReference) {
      return this.parse(
        current.replacement
      );
    }
    const parsed = this.parsePlugin(id, current);
    if (parsed) {
      return parsed;
    }
    switch (currentClass) {
      case Object:
        return this.parsePlainObject(
          id,
          current,
          false
        );
      case void 0:
        return this.parsePlainObject(
          id,
          current,
          true
        );
      case Date:
        return createDateNode(id, current);
      case RegExp:
        return createRegExpNode(id, current);
      case Error:
      case EvalError:
      case RangeError:
      case ReferenceError:
      case SyntaxError:
      case TypeError:
      case URIError:
        return this.parseError(id, current);
      case Number:
      case Boolean:
      case String:
      case BigInt:
        return this.parseBoxed(id, current);
      case ArrayBuffer:
        return createArrayBufferNode(id, current);
      case Int8Array:
      case Int16Array:
      case Int32Array:
      case Uint8Array:
      case Uint16Array:
      case Uint32Array:
      case Uint8ClampedArray:
      case Float32Array:
      case Float64Array:
        return this.parseTypedArray(id, current);
      case DataView:
        return this.parseDataView(id, current);
      case Map:
        return this.parseMap(id, current);
      case Set:
        return this.parseSet(id, current);
    }
    if (currentClass === Promise || current instanceof Promise) {
      return this.parsePromise(id, current);
    }
    const currentFeatures = this.features;
    if (currentFeatures & 16) {
      switch (currentClass) {
        case BigInt64Array:
        case BigUint64Array:
          return this.parseBigIntTypedArray(
            id,
            current
          );
      }
    }
    if (currentFeatures & 1 && typeof AggregateError !== "undefined" && (currentClass === AggregateError || current instanceof AggregateError)) {
      return this.parseAggregateError(id, current);
    }
    if (current instanceof Error) {
      return this.parseError(id, current);
    }
    if (Symbol.iterator in current || Symbol.asyncIterator in current) {
      return this.parsePlainObject(id, current, !!currentClass);
    }
    throw new SerovalUnsupportedTypeError(current);
  }
  parseFunction(current) {
    const ref = this.getReference(current);
    if (ref.type !== 0) {
      return ref.value;
    }
    const plugin = this.parsePlugin(ref.value, current);
    if (plugin) {
      return plugin;
    }
    throw new SerovalUnsupportedTypeError(current);
  }
  parse(current) {
    switch (typeof current) {
      case "boolean":
        return current ? TRUE_NODE : FALSE_NODE;
      case "undefined":
        return UNDEFINED_NODE;
      case "string":
        return createStringNode(current);
      case "number":
        return createNumberNode(current);
      case "bigint":
        return createBigIntNode(current);
      case "object": {
        if (current) {
          const ref = this.getReference(current);
          return ref.type === 0 ? this.parseObject(ref.value, current) : ref.value;
        }
        return NULL_NODE;
      }
      case "symbol":
        return this.parseWellKnownSymbol(current);
      case "function": {
        return this.parseFunction(current);
      }
      default:
        throw new SerovalUnsupportedTypeError(current);
    }
  }
  parseTop(current) {
    try {
      return this.parse(current);
    } catch (error) {
      throw error instanceof SerovalParserError ? error : new SerovalParserError(error);
    }
  }
};
var BaseStreamParserContext = class extends BaseSyncParserContext {
  constructor(options) {
    super(options);
    this.alive = true;
    this.pending = 0;
    this.initial = true;
    this.buffer = [];
    this.onParseCallback = options.onParse;
    this.onErrorCallback = options.onError;
    this.onDoneCallback = options.onDone;
  }
  onParseInternal(node, initial) {
    try {
      this.onParseCallback(node, initial);
    } catch (error) {
      this.onError(error);
    }
  }
  flush() {
    for (let i = 0, len = this.buffer.length; i < len; i++) {
      this.onParseInternal(this.buffer[i], false);
    }
  }
  onParse(node) {
    if (this.initial) {
      this.buffer.push(node);
    } else {
      this.onParseInternal(node, false);
    }
  }
  onError(error) {
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    } else {
      throw error;
    }
  }
  onDone() {
    if (this.onDoneCallback) {
      this.onDoneCallback();
    }
  }
  pushPendingState() {
    this.pending++;
  }
  popPendingState() {
    if (--this.pending <= 0) {
      this.onDone();
    }
  }
  parseProperties(properties) {
    const entries = Object.entries(properties);
    const keyNodes = [];
    const valueNodes = [];
    for (let i = 0, len = entries.length; i < len; i++) {
      keyNodes.push(serializeString(entries[i][0]));
      valueNodes.push(this.parse(entries[i][1]));
    }
    let symbol = Symbol.iterator;
    if (symbol in properties) {
      keyNodes.push(this.parseWellKnownSymbol(symbol));
      valueNodes.push(
        createIteratorFactoryInstanceNode(
          this.parseIteratorFactory(),
          this.parse(
            iteratorToSequence(properties)
          )
        )
      );
    }
    symbol = Symbol.asyncIterator;
    if (symbol in properties) {
      keyNodes.push(this.parseWellKnownSymbol(symbol));
      valueNodes.push(
        createAsyncIteratorFactoryInstanceNode(
          this.parseAsyncIteratorFactory(),
          this.parse(
            createStreamFromAsyncIterable(
              properties
            )
          )
        )
      );
    }
    symbol = Symbol.toStringTag;
    if (symbol in properties) {
      keyNodes.push(this.parseWellKnownSymbol(symbol));
      valueNodes.push(createStringNode(properties[symbol]));
    }
    symbol = Symbol.isConcatSpreadable;
    if (symbol in properties) {
      keyNodes.push(this.parseWellKnownSymbol(symbol));
      valueNodes.push(properties[symbol] ? TRUE_NODE : FALSE_NODE);
    }
    return {
      k: keyNodes,
      v: valueNodes,
      s: keyNodes.length
    };
  }
  handlePromiseSuccess(id, data) {
    const parsed = this.parseWithError(data);
    if (parsed) {
      this.onParse(
        createSerovalNode(
          23,
          id,
          NIL,
          NIL,
          NIL,
          NIL,
          NIL,
          NIL,
          [this.parseSpecialReference(
            2
            /* PromiseSuccess */
          ), parsed],
          NIL,
          NIL,
          NIL
        )
      );
    }
    this.popPendingState();
  }
  handlePromiseFailure(id, data) {
    if (this.alive) {
      const parsed = this.parseWithError(data);
      if (parsed) {
        this.onParse(
          createSerovalNode(
            24,
            id,
            NIL,
            NIL,
            NIL,
            NIL,
            NIL,
            NIL,
            [
              this.parseSpecialReference(
                3
                /* PromiseFailure */
              ),
              parsed
            ],
            NIL,
            NIL,
            NIL
          )
        );
      }
    }
    this.popPendingState();
  }
  parsePromise(id, current) {
    const resolver = this.createIndex({});
    current.then(
      this.handlePromiseSuccess.bind(this, resolver),
      this.handlePromiseFailure.bind(this, resolver)
    );
    this.pushPendingState();
    return this.createPromiseConstructorNode(id, resolver);
  }
  parsePlugin(id, current) {
    const currentPlugins = this.plugins;
    if (currentPlugins) {
      for (let i = 0, len = currentPlugins.length; i < len; i++) {
        const plugin = currentPlugins[i];
        if (plugin.parse.stream && plugin.test(current)) {
          return createPluginNode(
            id,
            plugin.tag,
            plugin.parse.stream(current, this, {
              id
            })
          );
        }
      }
    }
    return NIL;
  }
  parseStream(id, current) {
    const result = createStreamConstructorNode(
      id,
      this.parseSpecialReference(
        4
        /* StreamConstructor */
      ),
      []
    );
    this.pushPendingState();
    current.on({
      next: (value) => {
        if (this.alive) {
          const parsed = this.parseWithError(value);
          if (parsed) {
            this.onParse(createStreamNextNode(id, parsed));
          }
        }
      },
      throw: (value) => {
        if (this.alive) {
          const parsed = this.parseWithError(value);
          if (parsed) {
            this.onParse(createStreamThrowNode(id, parsed));
          }
        }
        this.popPendingState();
      },
      return: (value) => {
        if (this.alive) {
          const parsed = this.parseWithError(value);
          if (parsed) {
            this.onParse(createStreamReturnNode(id, parsed));
          }
        }
        this.popPendingState();
      }
    });
    return result;
  }
  parseWithError(current) {
    try {
      return this.parse(current);
    } catch (err) {
      this.onError(err);
      return NIL;
    }
  }
  /**
   * @private
   */
  start(current) {
    const parsed = this.parseWithError(current);
    if (parsed) {
      this.onParseInternal(parsed, true);
      this.initial = false;
      this.flush();
      if (this.pending <= 0) {
        this.destroy();
      }
    }
  }
  /**
   * @private
   */
  destroy() {
    if (this.alive) {
      this.onDone();
      this.alive = false;
    }
  }
  isAlive() {
    return this.alive;
  }
};
var CrossStreamParserContext = class extends BaseStreamParserContext {
  constructor() {
    super(...arguments);
    this.mode = "cross";
  }
};
function crossSerializeStream(source, options) {
  const plugins = resolvePlugins(options.plugins);
  const ctx = new CrossStreamParserContext({
    plugins,
    refs: options.refs,
    disabledFeatures: options.disabledFeatures,
    onParse(node, initial) {
      const serial = new CrossSerializerContext({
        plugins,
        features: ctx.features,
        scopeId: options.scopeId,
        markedRefs: ctx.marked
      });
      let serialized;
      try {
        serialized = serial.serializeTop(node);
      } catch (err) {
        if (options.onError) {
          options.onError(err);
        }
        return;
      }
      options.onSerialize(serialized, initial);
    },
    onError: options.onError,
    onDone: options.onDone
  });
  ctx.start(source);
  return ctx.destroy.bind(ctx);
}
var READABLE_STREAM_FACTORY = {};
var ReadableStreamFactoryPlugin = /* @__PURE__ */ createPlugin({
  tag: "seroval-plugins/web/ReadableStreamFactory",
  test(value) {
    return value === READABLE_STREAM_FACTORY;
  },
  parse: {
    sync() {
      return void 0;
    },
    async async() {
      return await Promise.resolve(void 0);
    },
    stream() {
      return void 0;
    }
  },
  serialize(_node, ctx) {
    return ctx.createFunction(
      ["d"],
      "new ReadableStream({start:" + ctx.createEffectfulFunction(
        ["c"],
        "d.on({next:" + ctx.createEffectfulFunction(["v"], "try{c.enqueue(v)}catch{}") + ",throw:" + ctx.createEffectfulFunction(["v"], "c.error(v)") + ",return:" + ctx.createEffectfulFunction([], "try{c.close()}catch{}") + "})"
      ) + "})"
    );
  },
  deserialize() {
    return READABLE_STREAM_FACTORY;
  }
});
function toStream(value) {
  const stream = createStream();
  const reader = value.getReader();
  async function push() {
    try {
      const result = await reader.read();
      if (result.done) {
        stream.return(result.value);
      } else {
        stream.next(result.value);
        await push();
      }
    } catch (error) {
      stream.throw(error);
    }
  }
  push().catch(() => {
  });
  return stream;
}
var ReadableStreamPlugin = /* @__PURE__ */ createPlugin({
  tag: "seroval/plugins/web/ReadableStream",
  extends: [ReadableStreamFactoryPlugin],
  test(value) {
    if (typeof ReadableStream === "undefined") {
      return false;
    }
    return value instanceof ReadableStream;
  },
  parse: {
    sync(_value, ctx) {
      return {
        factory: ctx.parse(READABLE_STREAM_FACTORY),
        stream: ctx.parse(createStream())
      };
    },
    async async(value, ctx) {
      return {
        factory: await ctx.parse(READABLE_STREAM_FACTORY),
        stream: await ctx.parse(toStream(value))
      };
    },
    stream(value, ctx) {
      return {
        factory: ctx.parse(READABLE_STREAM_FACTORY),
        stream: ctx.parse(toStream(value))
      };
    }
  },
  serialize(node, ctx) {
    return "(" + ctx.serialize(node.factory) + ")(" + ctx.serialize(node.stream) + ")";
  },
  deserialize(node, ctx) {
    const stream = ctx.deserialize(node.stream);
    return new ReadableStream({
      start(controller) {
        stream.on({
          next(value) {
            try {
              controller.enqueue(value);
            } catch (e) {
            }
          },
          throw(value) {
            controller.error(value);
          },
          return() {
            try {
              controller.close();
            } catch (e) {
            }
          }
        });
      }
    });
  }
});
var readable_stream_default = ReadableStreamPlugin;
const minifiedTsrBootStrapScript = 'self.$_TSR={c:()=>{document.querySelectorAll(".\\\\$tsr").forEach(e=>{e.remove()})}};\n';
const ShallowErrorPlugin = /* @__PURE__ */ createPlugin({
  tag: "tanstack-start:seroval-plugins/Error",
  test(value) {
    return value instanceof Error;
  },
  parse: {
    sync(value, ctx) {
      return {
        message: ctx.parse(value.message)
      };
    },
    async async(value, ctx) {
      return {
        message: await ctx.parse(value.message)
      };
    },
    stream(value, ctx) {
      return {
        message: ctx.parse(value.message)
      };
    }
  },
  serialize(node, ctx) {
    return "new Error(" + ctx.serialize(node.message) + ")";
  },
  deserialize(node, ctx) {
    return new Error(ctx.deserialize(node.message));
  }
});
const GLOBAL_TSR = "$_TSR";
const SCOPE_ID = "tsr";
function dehydrateMatch(match) {
  const dehydratedMatch = {
    i: match.id,
    u: match.updatedAt,
    s: match.status
  };
  const properties = [
    ["__beforeLoadContext", "b"],
    ["loaderData", "l"],
    ["error", "e"],
    ["ssr", "ssr"]
  ];
  for (const [key, shorthand] of properties) {
    if (match[key] !== void 0) {
      dehydratedMatch[shorthand] = match[key];
    }
  }
  return dehydratedMatch;
}
function attachRouterServerSsrUtils(router, manifest) {
  router.ssr = {
    manifest
  };
  const serializationRefs = /* @__PURE__ */ new Map();
  let initialScriptSent = false;
  const getInitialScript = () => {
    if (initialScriptSent) {
      return "";
    }
    initialScriptSent = true;
    return `${getCrossReferenceHeader(SCOPE_ID)};${minifiedTsrBootStrapScript};`;
  };
  let _dehydrated = false;
  const listeners = [];
  router.serverSsr = {
    injectedHtml: [],
    injectHtml: (getHtml) => {
      const promise = Promise.resolve().then(getHtml);
      router.serverSsr.injectedHtml.push(promise);
      router.emit({
        type: "onInjectedHtml",
        promise
      });
      return promise.then(() => {
      });
    },
    injectScript: (getScript) => {
      return router.serverSsr.injectHtml(async () => {
        const script = await getScript();
        return `<script class='$tsr'>${getInitialScript()}${script};if (typeof $_TSR !== 'undefined') $_TSR.c()<\/script>`;
      });
    },
    dehydrate: async () => {
      var _a, _b, _c;
      invariant(!_dehydrated);
      let matchesToDehydrate = router.state.matches;
      if (router.isShell()) {
        matchesToDehydrate = matchesToDehydrate.slice(0, 1);
      }
      const matches = matchesToDehydrate.map(dehydrateMatch);
      const dehydratedRouter = {
        manifest: router.ssr.manifest,
        matches
      };
      const lastMatchId = (_a = matchesToDehydrate[matchesToDehydrate.length - 1]) == null ? void 0 : _a.id;
      if (lastMatchId) {
        dehydratedRouter.lastMatchId = lastMatchId;
      }
      dehydratedRouter.dehydratedData = await ((_c = (_b = router.options).dehydrate) == null ? void 0 : _c.call(_b));
      _dehydrated = true;
      const p = createControlledPromise();
      crossSerializeStream(dehydratedRouter, {
        refs: serializationRefs,
        // TODO make plugins configurable
        plugins: [readable_stream_default, ShallowErrorPlugin],
        onSerialize: (data, initial) => {
          const serialized = initial ? `${GLOBAL_TSR}["router"]=` + data : data;
          router.serverSsr.injectScript(() => serialized);
        },
        scopeId: SCOPE_ID,
        onDone: () => p.resolve(""),
        onError: (err) => p.reject(err)
      });
      router.serverSsr.injectHtml(() => p);
    },
    isDehydrated() {
      return _dehydrated;
    },
    onRenderFinished: (listener) => listeners.push(listener),
    setRenderFinished: () => {
      listeners.forEach((l) => l());
    }
  };
}
function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}
var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => {
  __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Error extends Error {
  constructor(message, opts = {}) {
    super(message, opts);
    __publicField$2(this, "statusCode", 500);
    __publicField$2(this, "fatal", false);
    __publicField$2(this, "unhandled", false);
    __publicField$2(this, "statusMessage");
    __publicField$2(this, "data");
    __publicField$2(this, "cause");
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
__publicField$2(H3Error, "__h3_error__", true);
function createError(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function isError(input) {
  var _a;
  return ((_a = input == null ? void 0 : input.constructor) == null ? void 0 : _a.__h3_error__) === true;
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const xForwardedHost = event.node.req.headers["x-forwarded-host"];
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  var _a;
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return ((_a = event.node.req.connection) == null ? void 0 : _a.encrypted) ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}
function toWebRequest(event) {
  var _a;
  return ((_a = event.web) == null ? void 0 : _a.request) || new Request(getRequestURL(event), {
    // @ts-ignore Undici option
    duplex: "half",
    method: event.method,
    headers: event.headers,
    body: getRequestWebStream(event)
  });
}
const RawBodySymbol = Symbol.for("h3RawBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  var _a, _b;
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || ((_b = (_a = event.web) == null ? void 0 : _a.request) == null ? void 0 : _b.body) || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
function getRequestWebStream(event) {
  var _a, _b;
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = ((_b = (_a = event.web) == null ? void 0 : _a.request) == null ? void 0 : _b.body) || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}
typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function getResponseStatus$1(event) {
  return event.node.res.statusCode;
}
function getResponseHeaders$1(event) {
  return event.node.res.getHeaders();
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Event {
  constructor(req, res) {
    __publicField(this, "__is_event__", true);
    __publicField(this, "node");
    __publicField(this, "web");
    __publicField(this, "context", {});
    __publicField(this, "_method");
    __publicField(this, "_path");
    __publicField(this, "_headers");
    __publicField(this, "_requestBody");
    __publicField(this, "_handled", false);
    __publicField(this, "_onBeforeResponseCalled");
    __publicField(this, "_onAfterResponseCalled");
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}
function defineEventHandler$1(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventStorage = new AsyncLocalStorage();
function defineEventHandler(handler) {
  return defineEventHandler$1((event) => {
    return runWithEvent(event, () => handler(event));
  });
}
async function runWithEvent(event, fn) {
  return eventStorage.run(event, fn);
}
function getEvent() {
  const event = eventStorage.getStore();
  if (!event) {
    throw new Error(
      `No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`
    );
  }
  return event;
}
const HTTPEventSymbol = Symbol("$HTTPEvent");
function isEvent(obj) {
  return typeof obj === "object" && (obj instanceof H3Event || (obj == null ? void 0 : obj[HTTPEventSymbol]) instanceof H3Event || (obj == null ? void 0 : obj.__is_event__) === true);
}
function createWrapperFunction(h3Function) {
  return function(...args) {
    const event = args[0];
    if (!isEvent(event)) {
      args.unshift(getEvent());
    } else {
      args[0] = event instanceof H3Event || event.__is_event__ ? event : event[HTTPEventSymbol];
    }
    return h3Function(...args);
  };
}
const getResponseStatus = createWrapperFunction(getResponseStatus$1);
const getResponseHeaders = createWrapperFunction(getResponseHeaders$1);
function requestHandler(handler) {
  return handler;
}
const VIRTUAL_MODULES = {
  routeTree: "tanstack-start-route-tree:v",
  startManifest: "tanstack-start-manifest:v",
  serverFnManifest: "tanstack-start-server-fn-manifest:v"
};
async function loadVirtualModule(id) {
  switch (id) {
    case VIRTUAL_MODULES.routeTree:
      return await Promise.resolve().then(() => routeTree_gen);
    case VIRTUAL_MODULES.startManifest:
      return await import('./_tanstack-start-manifest_v-CZW80TkK.mjs');
    case VIRTUAL_MODULES.serverFnManifest:
      return await import('./_tanstack-start-server-fn-manifest_v-CKZaNYJP.mjs');
    default:
      throw new Error(`Unknown virtual module: ${id}`);
  }
}
async function getStartManifest(opts) {
  const { tsrStartManifest } = await loadVirtualModule(
    VIRTUAL_MODULES.startManifest
  );
  const startManifest = tsrStartManifest();
  const rootRoute = startManifest.routes[rootRouteId] = startManifest.routes[rootRouteId] || {};
  rootRoute.assets = rootRoute.assets || [];
  let script = `import('${startManifest.clientEntry}')`;
  rootRoute.assets.push({
    tag: "script",
    attrs: {
      type: "module",
      suppressHydrationWarning: true,
      async: true
    },
    children: script
  });
  const manifest = {
    ...startManifest,
    routes: Object.fromEntries(
      Object.entries(startManifest.routes).map(([k, v]) => {
        const { preloads, assets } = v;
        return [
          k,
          {
            preloads,
            assets
          }
        ];
      })
    )
  };
  return manifest;
}
function sanitizeBase(base) {
  return base.replace(/^\/|\/$/g, "");
}
async function revive(root, reviver) {
  async function reviveNode(holder2, key) {
    const value = holder2[key];
    if (value && typeof value === "object") {
      await Promise.all(Object.keys(value).map((k) => reviveNode(value, k)));
    }
    if (reviver) {
      holder2[key] = await reviver(key, holder2[key]);
    }
  }
  const holder = {
    "": root
  };
  await reviveNode(holder, "");
  return holder[""];
}
async function reviveServerFns(key, value) {
  if (value && value.__serverFn === true && value.functionId) {
    const serverFn = await getServerFnById(value.functionId);
    return async (opts, signal) => {
      const result = await serverFn(opts ?? {}, signal);
      return result.result;
    };
  }
  return value;
}
async function getServerFnById(serverFnId) {
  const {
    default: serverFnManifest
  } = await loadVirtualModule(VIRTUAL_MODULES.serverFnManifest);
  const serverFnInfo = serverFnManifest[serverFnId];
  if (!serverFnInfo) {
    console.info("serverFnManifest", serverFnManifest);
    throw new Error("Server function info not found for " + serverFnId);
  }
  const fnModule = await serverFnInfo.importer();
  if (!fnModule) {
    console.info("serverFnInfo", serverFnInfo);
    throw new Error("Server function module not resolved for " + serverFnId);
  }
  const action = fnModule[serverFnInfo.functionName];
  if (!action) {
    console.info("serverFnInfo", serverFnInfo);
    console.info("fnModule", fnModule);
    throw new Error(`Server function module export not resolved for serverFn ID: ${serverFnId}`);
  }
  return action;
}
async function parsePayload(payload) {
  const parsedPayload = startSerializer.parse(payload);
  await revive(parsedPayload, reviveServerFns);
  return parsedPayload;
}
const handleServerAction = async ({
  request
}) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const abort = () => controller.abort();
  request.signal.addEventListener("abort", abort);
  const method = request.method;
  const url2 = new URL(request.url, "http://localhost:3000");
  const regex = new RegExp(`${sanitizeBase("/_serverFn")}/([^/?#]+)`);
  const match = url2.pathname.match(regex);
  const serverFnId = match ? match[1] : null;
  const search = Object.fromEntries(url2.searchParams.entries());
  const isCreateServerFn = "createServerFn" in search;
  const isRaw = "raw" in search;
  if (typeof serverFnId !== "string") {
    throw new Error("Invalid server action param for serverFnId: " + serverFnId);
  }
  const action = await getServerFnById(serverFnId);
  const formDataContentTypes = ["multipart/form-data", "application/x-www-form-urlencoded"];
  const response = await (async () => {
    try {
      let result = await (async () => {
        if (request.headers.get("Content-Type") && formDataContentTypes.some((type) => {
          var _a;
          return (_a = request.headers.get("Content-Type")) == null ? void 0 : _a.includes(type);
        })) {
          invariant(method.toLowerCase() !== "get", "GET requests with FormData payloads are not supported");
          return await action(await request.formData(), signal);
        }
        if (method.toLowerCase() === "get") {
          let payload2 = search;
          if (isCreateServerFn) {
            payload2 = search.payload;
          }
          payload2 = payload2 ? await parsePayload(payload2) : payload2;
          return await action(payload2, signal);
        }
        const jsonPayloadAsString = await request.text();
        const payload = await parsePayload(jsonPayloadAsString);
        if (isCreateServerFn) {
          return await action(payload, signal);
        }
        return await action(...payload, signal);
      })();
      if (result.result instanceof Response) {
        return result.result;
      }
      if (!isCreateServerFn) {
        result = result.result;
        if (result instanceof Response) {
          return result;
        }
      }
      if (isNotFound(result)) {
        return isNotFoundResponse(result);
      }
      return new Response(result !== void 0 ? startSerializer.stringify(result) : void 0, {
        status: getResponseStatus(getEvent()),
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      if (error instanceof Response) {
        return error;
      }
      if (isNotFound(error)) {
        return isNotFoundResponse(error);
      }
      console.info();
      console.info("Server Fn Error!");
      console.info();
      console.error(error);
      console.info();
      return new Response(startSerializer.stringify(error), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  })();
  request.signal.removeEventListener("abort", abort);
  if (isRaw) {
    return response;
  }
  return response;
};
function isNotFoundResponse(error) {
  const {
    headers,
    ...rest
  } = error;
  return new Response(JSON.stringify(rest), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...headers || {}
    }
  });
}
const HEADERS = {
  TSS_SHELL: "X-TSS_SHELL"
};
function getStartResponseHeaders(opts) {
  const headers = mergeHeaders(
    getResponseHeaders(),
    {
      "Content-Type": "text/html; charset=UTF-8"
    },
    ...opts.router.state.matches.map((match) => {
      return match.headers;
    })
  );
  return headers;
}
function createStartHandler({
  createRouter: createRouter2
}) {
  let routeTreeModule = null;
  let startRoutesManifest = null;
  let processedServerRouteTree = void 0;
  return (cb) => {
    const originalFetch = globalThis.fetch;
    const startRequestResolver = async ({ request }) => {
      globalThis.fetch = async function(input, init) {
        function resolve(url22, requestOptions) {
          const fetchRequest = new Request(url22, requestOptions);
          return startRequestResolver({ request: fetchRequest });
        }
        function getOrigin() {
          return request.headers.get("Origin") || request.headers.get("Referer") || "http://localhost";
        }
        if (typeof input === "string" && input.startsWith("/")) {
          const url22 = new URL(input, getOrigin());
          return resolve(url22, init);
        } else if (typeof input === "object" && "url" in input && typeof input.url === "string" && input.url.startsWith("/")) {
          const url22 = new URL(input.url, getOrigin());
          return resolve(url22, init);
        }
        return originalFetch(input, init);
      };
      const url2 = new URL(request.url);
      const href = url2.href.replace(url2.origin, "");
      const APP_BASE = "/";
      const router = await createRouter2();
      const history = createMemoryHistory({
        initialEntries: [href]
      });
      const isPrerendering = process.env.TSS_PRERENDERING === "true";
      let isShell = process.env.TSS_SHELL === "true";
      if (isPrerendering && !isShell) {
        isShell = request.headers.get(HEADERS.TSS_SHELL) === "true";
      }
      router.update({
        history,
        isShell,
        isPrerendering
      });
      const response = await (async () => {
        try {
          if (false) ;
          const serverFnBase = joinPaths([
            APP_BASE,
            trimPath("/_serverFn"),
            "/"
          ]);
          if (href.startsWith(serverFnBase)) {
            return await handleServerAction({ request });
          }
          if (routeTreeModule === null) {
            try {
              routeTreeModule = await loadVirtualModule(
                VIRTUAL_MODULES.routeTree
              );
              if (routeTreeModule.serverRouteTree) {
                processedServerRouteTree = processRouteTree({
                  routeTree: routeTreeModule.serverRouteTree,
                  initRoute: (route, i) => {
                    route.init({
                      originalIndex: i
                    });
                  }
                });
              }
            } catch (e) {
              console.log(e);
            }
          }
          const executeRouter = () => runWithStartContext({ router }, async () => {
            const requestAcceptHeader = request.headers.get("Accept") || "*/*";
            const splitRequestAcceptHeader = requestAcceptHeader.split(",");
            const supportedMimeTypes = ["*/*", "text/html"];
            const isRouterAcceptSupported = supportedMimeTypes.some(
              (mimeType) => splitRequestAcceptHeader.some(
                (acceptedMimeType) => acceptedMimeType.trim().startsWith(mimeType)
              )
            );
            if (!isRouterAcceptSupported) {
              return json(
                {
                  error: "Only HTML requests are supported here"
                },
                {
                  status: 500
                }
              );
            }
            if (startRoutesManifest === null) {
              startRoutesManifest = await getStartManifest({
                basePath: APP_BASE
              });
            }
            attachRouterServerSsrUtils(router, startRoutesManifest);
            await router.load();
            if (router.state.redirect) {
              return router.state.redirect;
            }
            await router.serverSsr.dehydrate();
            const responseHeaders = getStartResponseHeaders({ router });
            const response2 = await cb({
              request,
              router,
              responseHeaders
            });
            return response2;
          });
          if (processedServerRouteTree) {
            const [_matchedRoutes, response2] = await handleServerRoutes({
              processedServerRouteTree,
              router,
              request,
              basePath: APP_BASE,
              executeRouter
            });
            if (response2) return response2;
          }
          const routerResponse = await executeRouter();
          return routerResponse;
        } catch (err) {
          if (err instanceof Response) {
            return err;
          }
          throw err;
        }
      })();
      if (isRedirect(response)) {
        if (isResolvedRedirect(response)) {
          if (request.headers.get("x-tsr-redirect") === "manual") {
            return json(
              {
                ...response.options,
                isSerializedRedirect: true
              },
              {
                headers: response.headers
              }
            );
          }
          return response;
        }
        if (response.options.to && typeof response.options.to === "string" && !response.options.to.startsWith("/")) {
          throw new Error(
            `Server side redirects must use absolute paths via the 'href' or 'to' options. The redirect() method's "to" property accepts an internal path only. Use the "href" property to provide an external URL. Received: ${JSON.stringify(response.options)}`
          );
        }
        if (["params", "search", "hash"].some(
          (d) => typeof response.options[d] === "function"
        )) {
          throw new Error(
            `Server side redirects must use static search, params, and hash values and do not support functional values. Received functional values for: ${Object.keys(
              response.options
            ).filter((d) => typeof response.options[d] === "function").map((d) => `"${d}"`).join(", ")}`
          );
        }
        const redirect = router.resolveRedirect(response);
        if (request.headers.get("x-tsr-redirect") === "manual") {
          return json(
            {
              ...response.options,
              isSerializedRedirect: true
            },
            {
              headers: response.headers
            }
          );
        }
        return redirect;
      }
      return response;
    };
    return requestHandler(startRequestResolver);
  };
}
async function handleServerRoutes(opts) {
  var _a, _b;
  const url2 = new URL(opts.request.url);
  const pathname = url2.pathname;
  const serverTreeResult = getMatchedRoutes({
    pathname,
    basepath: opts.basePath,
    caseSensitive: true,
    routesByPath: opts.processedServerRouteTree.routesByPath,
    routesById: opts.processedServerRouteTree.routesById,
    flatRoutes: opts.processedServerRouteTree.flatRoutes
  });
  const routeTreeResult = opts.router.getMatchedRoutes(pathname, void 0);
  let response;
  let matchedRoutes = [];
  matchedRoutes = serverTreeResult.matchedRoutes;
  if (routeTreeResult.foundRoute) {
    if (serverTreeResult.matchedRoutes.length < routeTreeResult.matchedRoutes.length) {
      const closestCommon = [...routeTreeResult.matchedRoutes].reverse().find((r) => {
        return opts.processedServerRouteTree.routesById[r.id] !== void 0;
      });
      if (closestCommon) {
        let routeId = closestCommon.id;
        matchedRoutes = [];
        do {
          const route = opts.processedServerRouteTree.routesById[routeId];
          if (!route) {
            break;
          }
          matchedRoutes.push(route);
          routeId = (_a = route.parentRoute) == null ? void 0 : _a.id;
        } while (routeId);
        matchedRoutes.reverse();
      }
    }
  }
  if (matchedRoutes.length) {
    const middlewares = flattenMiddlewares(
      matchedRoutes.flatMap((r) => r.options.middleware).filter(Boolean)
    ).map((d) => d.options.server);
    if ((_b = serverTreeResult.foundRoute) == null ? void 0 : _b.options.methods) {
      const method = Object.keys(
        serverTreeResult.foundRoute.options.methods
      ).find(
        (method2) => method2.toLowerCase() === opts.request.method.toLowerCase()
      );
      if (method) {
        const handler = serverTreeResult.foundRoute.options.methods[method];
        if (handler) {
          if (typeof handler === "function") {
            middlewares.push(handlerToMiddleware(handler));
          } else {
            if (handler._options.middlewares && handler._options.middlewares.length) {
              middlewares.push(
                ...flattenMiddlewares(handler._options.middlewares).map(
                  (d) => d.options.server
                )
              );
            }
            if (handler._options.handler) {
              middlewares.push(handlerToMiddleware(handler._options.handler));
            }
          }
        }
      }
    }
    middlewares.push(handlerToMiddleware(opts.executeRouter));
    const ctx = await executeMiddleware(middlewares, {
      request: opts.request,
      context: {},
      params: serverTreeResult.routeParams,
      pathname
    });
    response = ctx.response;
  }
  return [matchedRoutes, response];
}
function handlerToMiddleware(handler) {
  return async ({ next: _next, ...rest }) => {
    const response = await handler(rest);
    if (response) {
      return { response };
    }
    return _next(rest);
  };
}
function executeMiddleware(middlewares, ctx) {
  let index = -1;
  const next = async (ctx2) => {
    index++;
    const middleware = middlewares[index];
    if (!middleware) return ctx2;
    const result = await middleware({
      ...ctx2,
      // Allow the middleware to call the next middleware in the chain
      next: async (nextCtx) => {
        const nextResult = await next({
          ...ctx2,
          ...nextCtx,
          context: {
            ...ctx2.context,
            ...(nextCtx == null ? void 0 : nextCtx.context) || {}
          }
        });
        return Object.assign(ctx2, handleCtxResult(nextResult));
      }
      // Allow the middleware result to extend the return context
    }).catch((err) => {
      if (isSpecialResponse(err)) {
        return {
          response: err
        };
      }
      throw err;
    });
    return Object.assign(ctx2, handleCtxResult(result));
  };
  return handleCtxResult(next(ctx));
}
function handleCtxResult(result) {
  if (isSpecialResponse(result)) {
    return {
      response: result
    };
  }
  return result;
}
function isSpecialResponse(err) {
  return isResponse(err) || isRedirect(err);
}
function isResponse(response) {
  return response instanceof Response;
}
function createServerFileRoute(_) {
  return createServerRoute();
}
function createServerRoute(__, __opts) {
  const options = __opts || {};
  const route = {
    isRoot: false,
    path: "",
    id: "",
    fullPath: "",
    to: "",
    options,
    parentRoute: void 0,
    _types: {},
    // children: undefined as TChildren,
    middleware: (middlewares) => createServerRoute(void 0, {
      ...options,
      middleware: middlewares
    }),
    methods: (methodsOrGetMethods) => {
      const methods = (() => {
        if (typeof methodsOrGetMethods === "function") {
          return methodsOrGetMethods(createMethodBuilder());
        }
        return methodsOrGetMethods;
      })();
      return createServerRoute(void 0, {
        ...__opts,
        methods
      });
    },
    update: (opts) => createServerRoute(void 0, {
      ...options,
      ...opts
    }),
    init: (opts) => {
      var _a;
      options.originalIndex = opts.originalIndex;
      const isRoot = !options.path && !options.id;
      route.parentRoute = (_a = options.getParentRoute) == null ? void 0 : _a.call(options);
      if (isRoot) {
        route.path = rootRouteId;
      } else if (!route.parentRoute) {
        throw new Error(`Child Route instances must pass a 'getParentRoute: () => ParentRoute' option that returns a ServerRoute instance.`);
      }
      let path = isRoot ? rootRouteId : options.path;
      if (path && path !== "/") {
        path = trimPathLeft(path);
      }
      const customId = options.id || path;
      let id = isRoot ? rootRouteId : joinPaths([route.parentRoute.id === rootRouteId ? "" : route.parentRoute.id, customId]);
      if (path === rootRouteId) {
        path = "/";
      }
      if (id !== rootRouteId) {
        id = joinPaths(["/", id]);
      }
      const fullPath = id === rootRouteId ? "/" : joinPaths([route.parentRoute.fullPath, path]);
      route.path = path;
      route.id = id;
      route.fullPath = fullPath;
      route.to = fullPath;
      route.isRoot = isRoot;
    },
    _addFileChildren: (children) => {
      if (Array.isArray(children)) {
        route.children = children;
      }
      if (typeof children === "object" && children !== null) {
        route.children = Object.values(children);
      }
      return route;
    },
    _addFileTypes: () => route
  };
  return route;
}
const createServerRootRoute = createServerRoute;
const createMethodBuilder = (__opts) => {
  return {
    _options: __opts || {},
    _types: {},
    middleware: (middlewares) => createMethodBuilder({
      ...__opts,
      middlewares
    }),
    handler: (handler) => createMethodBuilder({
      ...__opts,
      handler
    })
  };
};
function routerWithQueryClient(router, queryClient, additionalOpts) {
  const ogOptions = router.options;
  router.options = {
    ...router.options,
    context: {
      ...ogOptions.context,
      // Pass the query client to the context, so we can access it in loaders
      queryClient
    },
    // Wrap the app in a QueryClientProvider
    Wrap: ({ children }) => {
      const OuterWrapper = Fragment;
      const OGWrap = ogOptions.Wrap || Fragment;
      return /* @__PURE__ */ jsx(OuterWrapper, { children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(OGWrap, { children }) }) });
    }
  };
  if (router.isServer) {
    const queryStream = createPushableStream();
    router.options.dehydrate = async () => {
      var _a;
      const ogDehydrated = await ((_a = ogOptions.dehydrate) == null ? void 0 : _a.call(ogOptions));
      const dehydratedQueryClient = dehydrate(queryClient);
      router.serverSsr.onRenderFinished(() => queryStream.close());
      const dehydratedRouter = {
        ...ogDehydrated,
        // When critical data is dehydrated, we also dehydrate the query client
        dehydratedQueryClient,
        // prepare the stream for queries coming up during rendering
        queryStream: queryStream.stream
      };
      return dehydratedRouter;
    };
    const ogClientOptions = queryClient.getDefaultOptions();
    queryClient.setDefaultOptions({
      ...ogClientOptions,
      dehydrate: {
        shouldDehydrateQuery: () => true,
        ...ogClientOptions.dehydrate
      }
    });
    queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "added") {
        if (!router.serverSsr.isDehydrated()) {
          return;
        }
        if (queryStream.isClosed()) {
          console.warn(
            `tried to stream query ${event.query.queryHash} after stream was already closed`
          );
          return;
        }
        queryStream.enqueue(
          dehydrate(queryClient, {
            shouldDehydrateQuery: (query) => {
              var _a, _b;
              if (query.queryHash === event.query.queryHash) {
                return ((_b = (_a = ogClientOptions.dehydrate) == null ? void 0 : _a.shouldDehydrateQuery) == null ? void 0 : _b.call(_a, query)) ?? true;
              }
              return false;
            }
          })
        );
      }
    });
  } else {
    router.options.hydrate = async (dehydrated) => {
      var _a;
      await ((_a = ogOptions.hydrate) == null ? void 0 : _a.call(ogOptions, dehydrated));
      hydrate(queryClient, dehydrated.dehydratedQueryClient);
      const reader = dehydrated.queryStream.getReader();
      reader.read().then(async function handle({ done, value }) {
        hydrate(queryClient, value);
        if (done) {
          return;
        }
        const result = await reader.read();
        return handle(result);
      }).catch((err) => {
        console.error("Error reading query stream:", err);
      });
    };
    {
      const ogMutationCacheConfig = queryClient.getMutationCache().config;
      queryClient.getMutationCache().config = {
        ...ogMutationCacheConfig,
        onError: (error, _variables, _context, _mutation) => {
          var _a;
          if (isRedirect(error)) {
            error.options._fromLocation = router.state.location;
            return router.navigate(router.resolveRedirect(error).options);
          }
          return (_a = ogMutationCacheConfig.onError) == null ? void 0 : _a.call(
            ogMutationCacheConfig,
            error,
            _variables,
            _context,
            _mutation
          );
        }
      };
      const ogQueryCacheConfig = queryClient.getQueryCache().config;
      queryClient.getQueryCache().config = {
        ...ogQueryCacheConfig,
        onError: (error, _query) => {
          var _a;
          if (isRedirect(error)) {
            error.options._fromLocation = router.state.location;
            return router.navigate(router.resolveRedirect(error).options);
          }
          return (_a = ogQueryCacheConfig.onError) == null ? void 0 : _a.call(ogQueryCacheConfig, error, _query);
        }
      };
    }
  }
  return router;
}
function createPushableStream() {
  let controllerRef;
  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;
    }
  });
  let _isClosed = false;
  return {
    stream,
    enqueue: (chunk) => controllerRef.enqueue(chunk),
    close: () => {
      controllerRef.close();
      _isClosed = true;
    },
    isClosed: () => _isClosed,
    error: (err) => controllerRef.error(err)
  };
}
function DefaultCatchBoundary({ error }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return /* @__PURE__ */ jsxDEV(ErrorComponent, { error }, void 0, false, {
    fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/DefaultCatchBoundary.tsx",
    lineNumber: 10,
    columnNumber: 9
  }, this);
}
function NotFound() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return /* @__PURE__ */ jsxDEV(Alert, { status: "danger", children: [
    /* @__PURE__ */ jsxDEV(Heading, { children: "Fehler" }, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/NotFound.tsx",
      lineNumber: 17,
      columnNumber: 4
    }, this),
    /* @__PURE__ */ jsxDEV(Content, { children: [
      /* @__PURE__ */ jsxDEV(Text, { children: "Die angeforderte Seite konnte nicht gefunden werden. Bitte überprüfen Sie die URL oder versuchen Sie es später erneut." }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/NotFound.tsx",
        lineNumber: 19,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ jsxDEV(
        Button,
        {
          onPress: () => {
            queryClient.invalidateQueries();
            router.invalidate({ sync: true });
          },
          children: "Nochmal versuchen"
        },
        void 0,
        false,
        {
          fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/NotFound.tsx",
          lineNumber: 23,
          columnNumber: 5
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/NotFound.tsx",
      lineNumber: 18,
      columnNumber: 4
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/components/NotFound.tsx",
    lineNumber: 16,
    columnNumber: 3
  }, this);
}
Feature.AggregateError | Feature.BigIntTypedArray;
const TanStackRouterDevtools = function() {
  return null;
} ;
const Route$1 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "My mittwald Extension"
      }
    ]
  }),
  component: RootComponent
});
function RootComponent() {
  const [isClient, setIsClient] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [RemoteRootComponent, setRemoteRootComponent] = useState(null);
  const [ReduxProviderComponent, setReduxProviderComponent] = useState(null);
  useEffect(() => {
    setIsClient(true);
    try {
      setIsEmbedded(window.self !== window.top);
    } catch {
      setIsEmbedded(false);
    }
  }, []);
  const renderContent = () => {
    if (!isClient || !RemoteRootComponent || !ReduxProviderComponent) {
      return /* @__PURE__ */ jsxDEV(LayoutCard, { children: /* @__PURE__ */ jsxDEV(Text, { children: "Extension wird initialisiert …" }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
        lineNumber: 79,
        columnNumber: 6
      }, this) }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
        lineNumber: 78,
        columnNumber: 5
      }, this);
    }
    if (!isEmbedded) {
      return /* @__PURE__ */ jsxDEV(LayoutCard, { children: /* @__PURE__ */ jsxDEV(Text, { children: "Diese Extension benötigt das mittwald mStudio. Bitte teste sie über eine eingebettete mStudio-Sitzung oder verwende die mittwald CLI Preview." }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
        lineNumber: 87,
        columnNumber: 6
      }, this) }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
        lineNumber: 86,
        columnNumber: 5
      }, this);
    }
    const RemoteRoot = RemoteRootComponent;
    const ReduxProvider = ReduxProviderComponent;
    return /* @__PURE__ */ jsxDEV(ReduxProvider, { children: /* @__PURE__ */ jsxDEV(RemoteRoot, { children: /* @__PURE__ */ jsxDEV(NotificationProvider, { children: /* @__PURE__ */ jsxDEV(LayoutCard, { children: /* @__PURE__ */ jsxDEV(Outlet, {}, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
      lineNumber: 104,
      columnNumber: 8
    }, this) }, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
      lineNumber: 103,
      columnNumber: 7
    }, this) }, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
      lineNumber: 102,
      columnNumber: 6
    }, this) }, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
      lineNumber: 101,
      columnNumber: 5
    }, this) }, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
      lineNumber: 100,
      columnNumber: 4
    }, this);
  };
  return /* @__PURE__ */ jsxDEV(RootDocument, { children: renderContent() }, void 0, false, {
    fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
    lineNumber: 112,
    columnNumber: 9
  }, this);
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxDEV("html", { lang: "en", children: [
    /* @__PURE__ */ jsxDEV("head", { children: /* @__PURE__ */ jsxDEV(HeadContent, {}, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
      lineNumber: 119,
      columnNumber: 5
    }, this) }, void 0, false, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
      lineNumber: 118,
      columnNumber: 4
    }, this),
    /* @__PURE__ */ jsxDEV("body", { children: [
      children,
      /* @__PURE__ */ jsxDEV(Scripts, {}, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
        lineNumber: 123,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ jsxDEV(TanStackRouterDevtools, { position: "bottom-right" }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
        lineNumber: 124,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ jsxDEV(ReactQueryDevtools, { buttonPosition: "bottom-left" }, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
        lineNumber: 125,
        columnNumber: 5
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
      lineNumber: 121,
      columnNumber: 4
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/routes/__root.tsx",
    lineNumber: 117,
    columnNumber: 3
  }, this);
}
const $$splitComponentImporter = () => import('./index-kPvcRalI.mjs');
const Route = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const envSchema = {
  // Database
  DATABASE_URL: url(),
  PRISMA_FIELD_ENCRYPTION_KEY: str(),
  // mittwald
  EXTENSION_ID: str(),
  EXTENSION_SECRET: str(),
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development"
  })
};
let env;
{
  env = cleanEnv(process.env, envSchema);
}
const createPrismaClient = () => new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
}).$extends(
  fieldEncryptionExtension({
    encryptionKey: env.PRISMA_FIELD_ENCRYPTION_KEY
  })
);
const globalForPrisma = globalThis;
const getDb = () => {
  return globalForPrisma.prisma ?? createPrismaClient();
};
const db = getDb();
{
  globalForPrisma.prisma = db;
}
class PrismaExtensionStorage {
  async upsertExtension(extension) {
    try {
      await db.extensionInstance.upsert({
        where: {
          id: extension.extensionInstanceId
        },
        update: {
          secret: extension.secret
        },
        create: {
          id: extension.extensionInstanceId,
          contextId: extension.contextId,
          active: true,
          secret: extension.secret
        }
      });
    } catch (error) {
      console.error("Error while upserting extension in extension storage", error);
      throw new Error("Failed to create or update extension instance");
    }
  }
  async updateExtension(extension) {
    try {
      await db.extensionInstance.update({
        where: {
          id: extension.extensionInstanceId
        },
        data: {
          id: extension.extensionInstanceId,
          contextId: extension.contextId,
          active: extension.enabled
        }
      });
    } catch (error) {
      console.error("Error while updating extension in extension storage", error);
      throw new Error("Failed to update extension instance");
    }
  }
  async rotateSecret(extensionInstanceId, secret) {
    try {
      await db.extensionInstance.update({
        where: {
          id: extensionInstanceId
        },
        data: {
          id: extensionInstanceId,
          secret
        }
      });
    } catch (error) {
      console.error("Error while rotating secret in extension storage", error);
      throw new Error("Failed to rotate extension secret");
    }
  }
  async removeInstance(extensionInstanceId) {
    try {
      await db.extensionInstance.delete({
        where: {
          id: extensionInstanceId
        }
      });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
        console.warn("Extension instance to remove does not exist, skipping deletion");
        return;
      }
      console.error("Error while removing extension instance in extension storage", error);
      throw new Error("Failed to remove extension instance");
    }
  }
}
const ServerRoute = createServerFileRoute().methods({
  POST: async ({
    request
  }) => {
    const combinedHandler = new CombinedWebhookHandlerFactory(new PrismaExtensionStorage(), env.EXTENSION_ID).build();
    try {
      const rawBody = await request.text();
      const signatureSerial = request.headers.get("X-Marketplace-Signature-Serial") || "";
      const signatureAlgorithm = request.headers.get("X-Marketplace-Signature-Algorithm") || "";
      const signature = request.headers.get("X-Marketplace-Signature") || "";
      const webhookContent = {
        rawBody,
        signatureSerial,
        signatureAlgorithm,
        signature
      };
      await combinedHandler(webhookContent);
    } catch (e) {
      console.error("Error while handling webhook", e);
      return new Response("Error handling webhook", {
        status: 400,
        statusText: "Internal Server Error"
      });
    }
    return new Response("Webhook handled successfully", {
      status: 200
    });
  }
});
const rootServerRouteImport = createServerRootRoute();
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$1
});
const ApiWebhooksMittwaldServerRoute = ServerRoute.update({
  id: "/api/webhooks/mittwald",
  path: "/api/webhooks/mittwald",
  getParentRoute: () => rootServerRouteImport
});
const rootRouteChildren = {
  IndexRoute
};
const routeTree = Route$1._addFileChildren(rootRouteChildren)._addFileTypes();
const rootServerRouteChildren = {
  ApiWebhooksMittwaldServerRoute
};
const serverRouteTree = rootServerRouteImport._addFileChildren(rootServerRouteChildren)._addFileTypes();
const routeTree_gen = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  routeTree,
  serverRouteTree
}, Symbol.toStringTag, { value: "Module" }));
function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1e3,
        // 5 minutes
        gcTime: 10 * 60 * 1e3,
        // 10 minutes garbage collection time
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1e3 * 2 ** attemptIndex, 3e4),
        refetchOnWindowFocus: false,
        // Disable refetch on window focus for extension
        networkMode: "online"
        // Only run queries when online
      }
    }
  });
  return routerWithQueryClient(
    createRouter$1({
      routeTree,
      context: { queryClient },
      defaultPreload: "intent",
      defaultErrorComponent: DefaultCatchBoundary,
      defaultNotFoundComponent: () => /* @__PURE__ */ jsxDEV(NotFound, {}, void 0, false, {
        fileName: "/Users/mbehring/Documents/Cursor/mittvibes/weatherapp/src/router.tsx",
        lineNumber: 28,
        columnNumber: 36
      }, this),
      // Deaktiviere SSR - Extension läuft nur client-seitig im iframe
      defaultSsr: false
    }),
    queryClient
  );
}
const serverEntry$1 = createStartHandler({
  createRouter
})(defaultStreamHandler);
const serverEntry = defineEventHandler(function(event) {
  const request = toWebRequest(event);
  return serverEntry$1({ request });
});

export { createServerFn as c, serverEntry as default, invariant as i };
//# sourceMappingURL=ssr.mjs.map

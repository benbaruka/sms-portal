import React from "react";

const dynamic = (importFn: any, options?: any) => {
  const Component = importFn();

  // Handle promise-based imports
  if (Component && typeof Component.then === "function") {
    return Component.then((mod: any) => {
      const LoadedComponent = mod.default || mod;
      return function DynamicWrapper(props: any) {
        return React.createElement(LoadedComponent, props);
      };
    });
  }

  // Handle direct imports
  const LoadedComponent = Component.default || Component;
  return function DynamicWrapper(props: any) {
    return React.createElement(LoadedComponent, props);
  };
};

export default dynamic;

import React, { useState, useEffect } from "react";

// Higher-order component to add delay
const withDelay = (WrappedComponent: any, delay = 500) => {
  return function DelayedComponent(props: any) {
    const [shouldRender, setShouldRender] = useState(
      !props.getAllDataFromGraph
    );

    useEffect(() => {
      if (props.getAllDataFromGraph) {
        const timer = setTimeout(() => {
          setShouldRender(true);
        }, delay);

        return () => clearTimeout(timer);
      }
    }, [props.getAllDataFromGraph]);

    if (!shouldRender) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default withDelay;

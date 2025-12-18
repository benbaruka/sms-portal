// Type declarations for Radix UI modules that are mocked in tests
// These modules are not installed but are mocked via jest.radix-ui.mock.js

declare module "@radix-ui/react-alert-dialog" {
  import * as React from "react";
  export const Root: React.ComponentType<any>;
  export const Trigger: React.ComponentType<any>;
  export const Portal: React.ComponentType<any>;
  export const Overlay: React.ComponentType<any>;
  export const Content: React.ComponentType<any>;
  export const Title: React.ComponentType<any>;
  export const Description: React.ComponentType<any>;
  export const Action: React.ComponentType<any>;
  export const Cancel: React.ComponentType<any>;
}

declare module "@radix-ui/react-aspect-ratio" {
  import * as React from "react";
  export const Root: React.ComponentType<any>;
}

declare module "@radix-ui/react-avatar" {
  import * as React from "react";
  export const Root: React.ComponentType<any>;
  export const Image: React.ComponentType<any>;
  export const Fallback: React.ComponentType<any>;
}

declare module "@radix-ui/react-context-menu" {
  import * as React from "react";
  export const Root: React.ForwardRefExoticComponent<any>;
  export const Trigger: React.ForwardRefExoticComponent<any>;
  export const Portal: React.ForwardRefExoticComponent<any>;
  export const Content: React.ForwardRefExoticComponent<any>;
  export const Item: React.ForwardRefExoticComponent<any>;
  export const Group: React.ForwardRefExoticComponent<any>;
  export const CheckboxItem: React.ForwardRefExoticComponent<any>;
  export const RadioItem: React.ForwardRefExoticComponent<any>;
  export const RadioGroup: React.ForwardRefExoticComponent<any>;
  export const Label: React.ForwardRefExoticComponent<any>;
  export const Separator: React.ForwardRefExoticComponent<any>;
  export const Sub: React.ForwardRefExoticComponent<any>;
  export const SubTrigger: React.ForwardRefExoticComponent<any>;
  export const SubContent: React.ForwardRefExoticComponent<any>;
  export const ItemIndicator: React.ForwardRefExoticComponent<any>;
}

declare module "react-day-picker" {
  import * as React from "react";
  export interface DayPickerProps {
    [key: string]: unknown;
  }
  export const DayPicker: React.ComponentType<DayPickerProps>;
}

declare module "embla-carousel-react" {
  import * as React from "react";
  export interface UseEmblaCarouselType {
    [0]: () => void;
    [1]: {
      scrollPrev: () => void;
      scrollNext: () => void;
      canScrollPrev: boolean;
      canScrollNext: boolean;
    };
  }
  export default function useEmblaCarousel(
    options?: unknown,
    plugins?: unknown[]
  ): UseEmblaCarouselType;
}

declare module "@radix-ui/react-dropdown-menu" {
  import * as React from "react";
  export const Root: React.ForwardRefExoticComponent<any>;
  export const Trigger: React.ForwardRefExoticComponent<any>;
  export const Group: React.ForwardRefExoticComponent<any>;
  export const Portal: React.ForwardRefExoticComponent<any>;
  export const Sub: React.ForwardRefExoticComponent<any>;
  export const RadioGroup: React.ForwardRefExoticComponent<any>;
  export const SubTrigger: React.ForwardRefExoticComponent<any>;
  export const SubContent: React.ForwardRefExoticComponent<any>;
  export const Content: React.ForwardRefExoticComponent<any>;
  export const Item: React.ForwardRefExoticComponent<any>;
  export const CheckboxItem: React.ForwardRefExoticComponent<any>;
  export const RadioItem: React.ForwardRefExoticComponent<any>;
  export const Label: React.ForwardRefExoticComponent<any>;
  export const Separator: React.ForwardRefExoticComponent<any>;
  export const Shortcut: React.ForwardRefExoticComponent<any>;
  export const ItemIndicator: React.ForwardRefExoticComponent<any>;
}

declare module "@radix-ui/react-hover-card" {
  import * as React from "react";
  export const Root: React.ForwardRefExoticComponent<any>;
  export const Trigger: React.ForwardRefExoticComponent<any>;
  export const Content: React.ForwardRefExoticComponent<any>;
}

declare module "@radix-ui/react-menubar" {
  import * as React from "react";
  export const Menu: React.ForwardRefExoticComponent<any>;
  export const Group: React.ForwardRefExoticComponent<any>;
  export const Portal: React.ForwardRefExoticComponent<any>;
  export const Sub: React.ForwardRefExoticComponent<any>;
  export const RadioGroup: React.ForwardRefExoticComponent<any>;
  export const Root: React.ForwardRefExoticComponent<any>;
  export const Trigger: React.ForwardRefExoticComponent<any>;
  export const Content: React.ForwardRefExoticComponent<any>;
  export const Item: React.ForwardRefExoticComponent<any>;
  export const CheckboxItem: React.ForwardRefExoticComponent<any>;
  export const RadioItem: React.ForwardRefExoticComponent<any>;
  export const Label: React.ForwardRefExoticComponent<any>;
  export const Separator: React.ForwardRefExoticComponent<any>;
  export const SubTrigger: React.ForwardRefExoticComponent<any>;
  export const SubContent: React.ForwardRefExoticComponent<any>;
  export const ItemIndicator: React.ForwardRefExoticComponent<any>;
}

declare module "@radix-ui/react-navigation-menu" {
  import * as React from "react";
  export const Root: React.ForwardRefExoticComponent<any>;
  export const List: React.ForwardRefExoticComponent<any>;
  export const Item: React.ForwardRefExoticComponent<any>;
  export const Trigger: React.ForwardRefExoticComponent<any>;
  export const Content: React.ForwardRefExoticComponent<any>;
  export const Link: React.ForwardRefExoticComponent<any>;
  export const Viewport: React.ForwardRefExoticComponent<any>;
  export const Indicator: React.ForwardRefExoticComponent<any>;
}

declare module "input-otp" {
  import * as React from "react";
  export interface OTPInputProps {
    [key: string]: unknown;
  }
  export const OTPInput: React.ForwardRefExoticComponent<OTPInputProps>;
  export const OTPInputContext: React.Context<any>;
  export const OTPInputGroup: React.ComponentType<any>;
  export const OTPInputSlot: React.ComponentType<any>;
  export const OTPInputSeparator: React.ComponentType<any>;
}

declare module "@radix-ui/react-checkbox" {
  import * as React from "react";
  export const Root: React.ForwardRefExoticComponent<any>;
  export const Indicator: React.ForwardRefExoticComponent<any>;
  export const Checkbox: React.ForwardRefExoticComponent<any>;
  export const CheckboxIndicator: React.ForwardRefExoticComponent<any>;
}

declare module "@radix-ui/react-progress" {
  import * as React from "react";
  export const Root: React.ForwardRefExoticComponent<any>;
  export const Indicator: React.ForwardRefExoticComponent<any>;
  export const Progress: React.ForwardRefExoticComponent<any>;
  export const ProgressIndicator: React.ForwardRefExoticComponent<any>;
}

declare module "vaul" {
  import * as React from "react";
  export const Drawer: {
    Root: React.ForwardRefExoticComponent<any>;
    Trigger: React.ForwardRefExoticComponent<any>;
    Portal: React.ForwardRefExoticComponent<any>;
    Overlay: React.ForwardRefExoticComponent<any>;
    Content: React.ForwardRefExoticComponent<any>;
    Title: React.ForwardRefExoticComponent<any>;
    Description: React.ForwardRefExoticComponent<any>;
    Close: React.ForwardRefExoticComponent<any>;
  };
}

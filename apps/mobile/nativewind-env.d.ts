/// <reference types="nativewind/types" />
/// <reference types="react-native-css-interop/types" />

// The triple-slash refs above augment the workspace-root copy of `react-native`,
// but apps/mobile/node_modules/react-native is a separate copy (npm workspace
// hoisting) and is the one screens actually import. Re-augment it here so the
// className prop reaches the imported types.
declare module 'react-native' {
  interface ViewProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface TextProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface ImagePropsBase {
    className?: string;
    cssInterop?: boolean;
  }
  interface SwitchProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface TouchableWithoutFeedbackProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface StatusBarProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface InputAccessoryViewProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface ScrollViewProps {
    contentContainerClassName?: string;
    indicatorClassName?: string;
  }
  interface FlatListProps<ItemT> {
    columnWrapperClassName?: string;
  }
  interface ImageBackgroundProps {
    imageClassName?: string;
  }
  interface TextInputProps {
    placeholderClassName?: string;
  }
  interface KeyboardAvoidingViewProps {
    contentContainerClassName?: string;
  }
  interface ModalBaseProps {
    presentationClassName?: string;
  }
}

export {};

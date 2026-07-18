declare module 'react-quill-new' {
  import * as React from 'react';
  
  export interface ReactQuillProps {
    theme?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (content: string, delta: any, source: string, editor: any) => void;
    onChangeSelection?: (selection: any, source: string, editor: any) => void;
    onFocus?: (selection: any, source: string, editor: any) => void;
    onBlur?: (previousSelection: any, source: string, editor: any) => void;
    onKeyDown?: React.EventHandler<any>;
    onKeyPress?: React.EventHandler<any>;
    onKeyUp?: React.EventHandler<any>;
    modules?: any;
    formats?: string[];
    bounds?: string | HTMLElement;
    children?: React.ReactElement<any>;
    className?: string;
    placeholder?: string;
    preserveWhitespace?: boolean;
    readOnly?: boolean;
    scrollingContainer?: string | HTMLElement;
    tabIndex?: number;
  }
  
  export default class ReactQuill extends React.Component<ReactQuillProps> {}
}

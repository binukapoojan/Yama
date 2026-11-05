/// <reference types="vite/client" />

declare module '*.twee?raw' {
  const content: string;
  export default content;
}

declare module '*.twee' {
  const content: string;
  export default content;
}

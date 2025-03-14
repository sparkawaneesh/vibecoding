declare module 'convex/react' {
  export function useQuery<T>(query: any, args?: any): T | undefined;
  export function useMutation<T>(mutation: any): (args: any) => Promise<T>;
} 
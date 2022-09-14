import { useMediaQuery } from '@react-devui/ui/hooks';

export function useDeviceQuery(): 'phone' | 'tablet' | 'desktop' {
  const breakpointsMatched = useMediaQuery();

  return breakpointsMatched.includes('xl') ? 'desktop' : breakpointsMatched.includes('md') ? 'tablet' : 'phone';
}

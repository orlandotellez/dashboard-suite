import { ReactNode } from 'react'

interface ThemeWrapperProps {
  children: ReactNode
}

export const ThemeWrapper = ({ children }: ThemeWrapperProps) => {
  return <>{children}</>
}
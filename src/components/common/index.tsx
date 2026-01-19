import cn from 'classnames';
import React, { PropsWithChildren } from 'react';

interface MainContentContainerProps extends PropsWithChildren {
  children: React.ReactNode;
  className?: string;
}
const MainContentContainer: React.FC<MainContentContainerProps> = (props) => {
  const { children, className } = props;
  return <div className={cn("mt-14 min-h-[calc(100%-4rem)]", className)}>{children}</div>;
};

export default MainContentContainer;

import React, { PropsWithChildren } from 'react';
import Navbar from '../atoms/navbar';
import MainContentContainer from '../common';
import LeftSidebar from '../organisms/newsfeed/LeftSidebar';

const FriendsLayout: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <div className="flex min-h-full w-full flex-col">
      <Navbar />

      <MainContentContainer className="sm:mt-20 mt-36">
        <div className="flex">
          <LeftSidebar className="max-lg:hidden mx-2" />
          <div className="flex-1 justify-center">

            {children}
            </div>
          {/* <RightSidebar /> */}
        </div>
      </MainContentContainer>
    </div>
  );
};

export default FriendsLayout;

import React, { PropsWithChildren, useState } from 'react';
import Navbar from '../atoms/navbar';
import MainContentContainer from '../common';
import MessageList from '../messenger/MessageList';

const ProfilePageLayout: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const [showMessages, setShowMessages] = useState<boolean>(false);

  return (
    <div className="flex h-full w-full flex-col">
      <Navbar />
      <MessageList isVisible={showMessages} onClose={() => setShowMessages(false)}/>
      <MainContentContainer>{children}</MainContentContainer>
    </div>
  );
};

export default ProfilePageLayout;

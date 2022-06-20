import { Blockquote, Timeline } from '@mantine/core';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Check, X } from 'tabler-icons-react';
import { socketMessage } from '../interfaces';

const Messages = ({ messages, canCloseMessages, handleCloseFeed }: { messages: socketMessage[], canCloseMessages: boolean, handleCloseFeed: () => void }) => {
	if (messages.length === 0) {
    return <></>;
  }
	return (
		<div className='px-8 my-5 py-8 w-1/2 h-half-screen bg-white rounded-sm flex flex-col relative'>
			<button onClick={handleCloseFeed} className={`${canCloseMessages ? 'absolute' : 'hidden'} top-5 right-5 text-red-600 hover:text-red-400 text-xl font-black`}>⨉</button>
			<div className='w-full text-center font-semibold text-2xl mb-4'>Feed</div>
			<div className='flex flex-col w-full p-4 bg-gray-200 h-half-screen rounded-sm overflow-y-auto'>
				<Timeline active={messages.length} bulletSize={30} lineWidth={2}>
					{messages
							.sort((a, b) => new Date(b.delivered).getTime() - new Date(a.delivered).getTime())
							.map((message, idx) => {
								return (
									<Timeline.Item
                    key={idx}
                    bullet={message.highlight ? <X /> : <Check />}
                    color={message.message.includes('Finished') ? 'green' : message.highlight ? 'red' : 'blue'}
										title={new Date(message.delivered).toLocaleString('en-GB').replace(',', '')}
									>
										<Blockquote cite={null} icon={null}>{message.message}</Blockquote>
									</Timeline.Item>
								);
							})}
				</Timeline>
			</div>
		</div>
	);
};

export default Messages;

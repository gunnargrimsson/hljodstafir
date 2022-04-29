import { Blockquote, Timeline } from '@mantine/core';
import React from 'react';
import { Check, X } from 'tabler-icons-react';
import { socketMessage } from '../interfaces';

const Messages = ({ messages }: { messages: socketMessage[] }) => {
  if (messages.length === 0) {
    return <></>;
  }
	return (
		<div className='px-5 my-10 py-4 w-1/2 h-half-screen bg-white rounded-sm flex flex-col'>
			<div className='w-full text-center font-semibold text-2xl mt-2 mb-4'>Feed</div>
			<div className='flex flex-col w-full p-4 bg-gray-200 h-half-screen rounded-sm overflow-y-auto'>
				<Timeline active={messages.length} bulletSize={30} lineWidth={2}>
					{messages
							.sort((a, b) => new Date(b.delivered).getTime() - new Date(a.delivered).getTime())
							.map((message, idx) => {
								return (
									<Timeline.Item
                    key={idx}
                    bullet={message.highlight ? <X /> : <Check />}
                    color={message.highlight ? 'red' : 'blue'}
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

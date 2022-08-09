import { Notification } from '@mantine/core'
import React from 'react'
import { Check, X } from 'tabler-icons-react';

interface NotificationProps {
  uploaded: boolean;
  setUploaded: React.Dispatch<React.SetStateAction<boolean>>;
  uploadMessage: string;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const Notifications = ({ uploaded, setUploaded, uploadMessage, error, setError} : NotificationProps) => {
  return (
    <div>
      {uploaded && (
				<Notification onClose={() => setUploaded(false)} icon={<Check size={18} />} color='teal' title='Upload Status'>
					{uploadMessage}
				</Notification>
			)}
			{error && (
				<Notification onClose={() => setError(null)} icon={<X size={18} />} color='red' title='Upload Status'>
					{error}
				</Notification>
			)}
    </div>
  )
}

export default Notifications
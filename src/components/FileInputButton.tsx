import React from 'react';

interface IFileInput {
	acceptedFileTypes?: string;
	allowMultipleFiles?: boolean;
	label: string;
	onChange: (formData: FormData) => void;
	uploadFileName: string;
}

const FileInputButton = ({ acceptedFileTypes, allowMultipleFiles, label, onChange, uploadFileName }: IFileInput) => {
	const fileInputRef = React.useRef<HTMLInputElement | null>(null);
	const formRef = React.useRef<HTMLFormElement | null>(null);

	const onClickHandler = () => {
		fileInputRef.current?.click();
	};

	const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files?.length) {
			return;
		}
		const formData = new FormData();
		Array.from(event.target.files).forEach((file) => {
			formData.append(event.target.name, file);
		});
		onChange(formData);
		formRef.current?.reset();
	};

	return (
		<form ref={formRef} className='flex place-content-center'>
			<button className='bg-primary font-bold text-white px-3 py-1 rounded-sm ring-1 ring-black hover:text-white hover:bg-black' type='button' onClick={onClickHandler}>
				{label}
			</button>
			<input
				accept={acceptedFileTypes}
				multiple={allowMultipleFiles}
				name={uploadFileName}
				onChange={onChangeHandler}
				ref={fileInputRef}
				type='file'
				style={{ display: 'none' }}
			/>
		</form>
	);
};

export default FileInputButton;

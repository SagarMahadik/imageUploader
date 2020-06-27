import React, { Component } from "react";

import Dropzone from "react-dropzone";
import ReactCrop from "react-image-crop";
import "./custom-image-crop.css";

import {
	base64StringtoFile,
	downloadBase64File,
	extractImageFileExtensionFromBase64,
	image64toCanvasRef,
} from "./ResuableUtils";

const imageMaxSize = 1000000000; // bytes
const acceptedFileTypes =
	"image/x-png, image/png, image/jpg, image/jpeg, image/gif";
const acceptedFileTypesArray = acceptedFileTypes.split(",").map((item) => {
	return item.trim();
});
class ImgDropAndCrop extends Component {
	constructor(props) {
		super(props);
		this.imagePreviewCanvasRef = React.createRef();
		this.fileInputRef = React.createRef();
		this.state = {
			imgSrc: null,
			imgSrcExt: null,
			crop: {
				aspect: 1 / 1,
			},
			setURL: false,
			imgURL: null,
		};
	}

	verifyFile = (files) => {
		if (files && files.length > 0) {
			const currentFile = files[0];
			const currentFileType = currentFile.type;
			const currentFileSize = currentFile.size;
			if (currentFileSize > imageMaxSize) {
				alert(
					"This file is not allowed. " +
						currentFileSize +
						" bytes is too large"
				);
				return false;
			}
			if (!acceptedFileTypesArray.includes(currentFileType)) {
				alert("This file is not allowed. Only images are allowed.");
				return false;
			}
			return true;
		}
	};

	handleOnDrop = (files, rejectedFiles) => {
		if (rejectedFiles && rejectedFiles.length > 0) {
			this.verifyFile(rejectedFiles);
		}

		if (files && files.length > 0) {
			const isVerified = this.verifyFile(files);
			if (isVerified) {
				// imageBase64Data
				const currentFile = files[0];
				const myFileItemReader = new FileReader();
				myFileItemReader.addEventListener(
					"load",
					() => {
						console.log(myFileItemReader.result);
						const myResult = myFileItemReader.result;
						this.setState({
							imgSrc: myResult,
							imgSrcExt: extractImageFileExtensionFromBase64(
								myResult
							),
						});
					},
					false
				);

				myFileItemReader.readAsDataURL(currentFile);
			}
		}
	};

	handleImageLoaded = (image) => {
		console.log(image);
	};
	handleOnCropChange = (crop) => {
		this.setState({ crop: crop });
	};
	handleOnCropComplete = (crop, pixelCrop) => {
		//console.log(crop, pixelCrop)

		const canvasRef = this.imagePreviewCanvasRef.current;
		const { imgSrc } = this.state;
		image64toCanvasRef(canvasRef, imgSrc, pixelCrop);
	};
	handleDownloadClick = (event) => {
		event.preventDefault();
		const { imgSrc } = this.state;

		//To handle the name of the file while downloading

		var fileName = `${this.fileInputRef.current.files[0].name}`;
		var remove_after = fileName.indexOf(".");
		var finalFileName = fileName.substring(0, remove_after);

		if (imgSrc) {
			const canvasRef = this.imagePreviewCanvasRef.current;

			const { imgSrcExt } = this.state;
			const imageData64 = canvasRef.toDataURL("image/" + imgSrcExt);

			const myFilename = `${finalFileName}`;

			// file to be uploaded
			const myNewCroppedFile = base64StringtoFile(
				imageData64,
				myFilename
			);
			console.log(myNewCroppedFile);
			// download file
			downloadBase64File(imageData64, myFilename);
			this.handleClearToDefault();
		}
	};

	setDisplayURL = () => {
		this.setState({ setURL: true });
		console.log(this.state.setURL);
	};

	handleUploadClick = (event) => {
		{
			event.preventDefault();
			const { imgSrc } = this.state;

			//To handle the name of the file while downloading

			var fileName = `${this.fileInputRef.current.files[0].name}`;
			var remove_after = fileName.indexOf(".");
			var finalFileName = fileName.substring(0, remove_after);

			const { setURL } = this.state;

			if (imgSrc) {
				const canvasRef = this.imagePreviewCanvasRef.current;

				const { imgSrcExt } = this.state;
				const imageData64 = canvasRef.toDataURL("image/" + imgSrcExt);
				const myFilename = `${finalFileName}`;

				// file to be uploaded
				const myNewCroppedFile = base64StringtoFile(
					imageData64,
					myFilename
				);

				console.log(myNewCroppedFile);

				const formData = new FormData();
				formData.append("file", myNewCroppedFile);
				formData.append("upload_preset", "xprl6rwq");
				const options = {
					method: "POST",
					body: formData,
				};

				return fetch(
					"https://api.Cloudinary.com/v1_1/antilibrary/image/upload",
					options
				)
					.then((res) => res.json())
					.then((res) =>
						this.setState({ imgURL: res.secure_url, setURL: true })
					)

					.catch((err) => console.log(err));
			}
		}
	};

	handleClearToDefault = (event) => {
		if (event) event.preventDefault();
		const canvas = this.imagePreviewCanvasRef.current;
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		this.setState({
			imgSrc: null,
			imgSrcExt: null,
			crop: {
				aspect: 1 / 1,
			},
			imgURL: null,
			setURL: false,
		});
		this.fileInputRef.current.value = null;
	};

	handleFileSelect = (event) => {
		console.log(event);
		const files = event.target.files;
		if (files && files.length > 0) {
			const isVerified = this.verifyFile(files);
			if (isVerified) {
				// imageBase64Data
				const currentFile = files[0];
				const myFileItemReader = new FileReader();
				myFileItemReader.addEventListener(
					"load",
					() => {
						console.log(myFileItemReader.result);
						const myResult = myFileItemReader.result;
						this.setState({
							imgSrc: myResult,
							imgSrcExt: extractImageFileExtensionFromBase64(
								myResult
							),
						});
					},
					false
				);

				myFileItemReader.readAsDataURL(currentFile);
			}
		}
	};
	render() {
		const { imgSrc, imgURL, setURL } = this.state;

		return (
			<div>
				<h1>Drop and Crop</h1>

				<input
					ref={this.fileInputRef}
					type="file"
					accept={acceptedFileTypes}
					multiple={false}
					onChange={this.handleFileSelect}
				/>
				{imgSrc !== null ? (
					<div>
						<ReactCrop
							src={imgSrc}
							crop={this.state.crop}
							onImageLoaded={this.handleImageLoaded}
							onComplete={this.handleOnCropComplete}
							onChange={this.handleOnCropChange}
						/>

						<br />
						<p>Preview Canvas Crop </p>
						<canvas ref={this.imagePreviewCanvasRef}></canvas>
						<button onClick={this.handleDownloadClick}>
							Download
						</button>
						<button onClick={this.handleUploadClick}>Upload</button>

						<button onClick={this.handleClearToDefault}>
							Clear
						</button>
						{setURL && <h1> {imgURL}</h1>}
					</div>
				) : (
					<Dropzone
						onDrop={this.handleOnDrop}
						accept={acceptedFileTypes}
						multiple={false}
						maxSize={imageMaxSize}
					>
						Drop image here or click to upload
					</Dropzone>
				)}
			</div>
		);
	}
}

export default ImgDropAndCrop;

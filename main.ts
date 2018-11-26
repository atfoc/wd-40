import {BrowserWindow} from 'electron';
import {app, protocol, ipcMain} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import  axios from 'axios';

let mainWindow : BrowserWindow | null = null;

function main()
{
	registerFileProtocol();
	mainWindow = new BrowserWindow();
	mainWindow.loadURL("file://build/index.html#/MainWindow");
	mainWindow.show();

}

app.on('ready', main);
ipcMain.on('imageDownload',(event:any, url:any, name:any)=>
{
	if(!(typeof url === 'string'))
	{
		return;
	}
	if(!(typeof name === 'string'))
	{
		return ;
	}

	axios.get(url,
	{
		responseType:'arraybuffer'
	})
		.then(value =>
		{
			let data:ArrayBuffer = value.data;
			let downloadFolder = app.getPath('downloads');
			fs.writeFileSync(path.join(downloadFolder, name),data);
		});

});

/**
 * This function intercept file: protocol
 * and resolves requested path based on
 * app path*/
function registerFileProtocol()
{
	protocol.interceptFileProtocol("file", (request, callback)=>
	{
		const protocol = 'file://';
		let url = decodeURIComponent(request.url);
		const hashIndex = url.indexOf("#");
		if(hashIndex !== -1)
		{

			url = url.slice(protocol.length, hashIndex);
		}
		else
		{
			url = url.slice(protocol.length);
		}

		const queryParametersIndex = url.indexOf('?');

		if(queryParametersIndex !== -1)
		{
			url = url.slice(0, queryParametersIndex);
		}

		if(!path.isAbsolute(url))
		{
			url = path.join(app.getAppPath(), url);
		}
		// Build complete path for node require function
		//console.log(url);

		// Replace backslashes by forward slashes (windows)
		// url = url.replace(/\\/g, '/');
		url = path.normalize(url);

		callback(url);
	});

}

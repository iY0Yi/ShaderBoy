if (window.pathMain !== '') {
			var fs = WScript.CreateObject("Scripting.FileSystemObject");
			var file = fs.OpenTextFile(window.pathMain, 2);
			file.Write(deepcopy(window.mainText));
			file.Close();
		}
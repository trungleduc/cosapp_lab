import os
from cosapp.core import __version__
import sys

OKGREEN = "\033[35m"
ENDC = "\033[0m"
LOGO = f"""    
█████████████████████████████████████████████████████████████████ 
            
         ██████╗ ██████╗ ███████╗ █████╗ ██████╗ ██████╗ 
        ██╔════╝██╔═══██╗██╔════╝██╔══██╗██╔══██╗██╔══██╗
        ██║     ██║   ██║███████╗███████║██████╔╝██████╔╝
        ██║     ██║   ██║╚════██║██╔══██║██╔═══╝ ██╔═══╝ 
        ╚██████╗╚██████╔╝███████║██║  ██║██║     ██║     
         ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝     
        
        CoSApp {__version__} - Collaborative System Approach     
█████████████████████████████████████████████████████████████████                                                
"""


try:
    from jupyterlab import labapp

    def cosapp_jupyterlab():
        argv = ["--ip=*"]
        if os.path.exists(
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
        ):
            import webbrowser

            webbrowser.register(
                "chrome-single-window",
                None,
                webbrowser.GenericBrowser(
                    [
                        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                        "--app=%s",
                    ]
                ),
            )
            argv.append("--browser=chrome-single-window")
        labapp.LabApp.launch_instance(argv)


except ImportError:
    cosapp_jupyterlab = None

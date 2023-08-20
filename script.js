let clickAdded = false;

const interval = setInterval(() => {

    console.log('checking')
    if (window.location.pathname.includes('/html5client')) {
        const c = document.querySelector('.sc-cvpDkg.da-dYbr')
        if (!c) {
            return;
        }

        if (c.querySelector('#electronBtn')) {
            return clearInterval(interval)
        }

        const canvas = document.createElement('canvas');
        canvas.width = 1920
        canvas.height = 1080
        const ctx = canvas.getContext('2d');
        document.body.append(canvas)


        const getDisplayMedia = navigator.mediaDevices.getDisplayMedia
        const getUserMedia = navigator.mediaDevices.getUserMedia
        const b = c.querySelector('& > button.sc-dJjYzT.cwAETT.lg.buttonWrapper')
        const x = b?.onclick;


        if (!b) {
            return;
        }

        if (clickAdded) {
            return clearInterval(interval);
        }


        console.log('injected ..')
        clickAdded = true
        b.onclick = () => {
            window.electronAPI.startRecording();
            window.electronAPI.handleNewFrame((frame) => {
                const image = new Image();
                image.src = frame;

                image.onload = () => ctx.drawImage(image, 0, 0);
            })
            navigator.mediaDevices.getUserMedia = (args) => { console.log({ args }); return Promise.resolve(canvas.captureStream()) };
            navigator.mediaDevices.getDisplayMedia = (args) => { console.log({ args }); return Promise.resolve(canvas.captureStream()) };
            x()
        }



        // function h() {
        //     if (!b) {
        //         return;
        //     }


        //     x = b.onclick;
        //     navigator.mediaDevices.getUserMedia = (args) => { console.log({ args }); Promise.resolve(canvas.captureStream()) };
        //     navigator.mediaDevices.getDisplayMedia = (args) => { console.log({ args }); Promise.resolve(canvas.captureStream()) };

        //     x()

        //     // navigator.mediaDevices.getUserMedia = getUserMedia;
        //     // navigator.mediaDevices.getDisplayMedia = getDisplayMedia;
        // }
        // const p = document.createElement('button')
        // p.id = 'electronBtn'
        // p.textContent = 'share portion'

        // c.append(p)
        // p.onclick = h;
    }

}, 1000);

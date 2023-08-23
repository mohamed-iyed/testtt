let clickAdded = false;

const interval = setInterval(() => {
    console.log('checking')
    if (window.location.pathname.includes('/html5client')) {
        const c = document.querySelector('.sc-dJrorO.kFuGdQ')
        if (!c) {
            return;
        }

        if (c.querySelector('#electronBtn')) {
            return clearInterval(interval)
        }

        const b = c.querySelector('& > button.sc-dJjYzT.cwAETT.lg.buttonWrapper')
        const x = b?.onclick;

        if (!b) {
            return;
        }

        if (clickAdded) {
            return clearInterval(interval);
        }

        const canvas = document.createElement('canvas');
        canvas.width = 1920
        canvas.height = 1080
        const ctx = canvas.getContext('2d');
        document.body.append(canvas)

        clickAdded = true
        b.onclick = async () => {
            window.electronAPI.startRecording();
            window.electronAPI.handleNewFrame((frame) => {
                const image = new Image();
                image.src = frame;
                image.onload = () => ctx.drawImage(image, 0, 0);
            });




            const s = canvas.captureStream(30)


            navigator.mediaDevices.getUserMedia = (args) => { console.log({ args }); return Promise.resolve(s) };
            navigator.mediaDevices.getDisplayMedia = (args) => { console.log({ args }); return Promise.resolve(s) };
            x()
            const mediaRecorder = new MediaRecorder(s, {
                mimeType: 'video/webm;codecs=h264',
                videoBitsPerSecond: 2500000,

            });

            // mediaRecorder.addEventListener('dataavailable', async (e) => {
            //     window.electronAPI.sendMediaData(await e.data.arrayBuffer());
            // });

            const shareYt = document.createElement('button')
            const youtubeLink = document.createElement('input')
            shareYt.textContent = 'Share To Youtube'

            shareYt.onclick = async () => {
                window.electronAPI.startShare(youtubeLink.value);

                const pc = new RTCPeerConnection({
                    iceServers: [
                        {
                            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
                        }
                    ]
                });

                pc.restartIce();

                pc.onnegotiationneeded = (e) => {
                    console.log({evenT: e})
                }


                const of = await pc.createOffer().catch(console.log);
                await pc.setLocalDescription(of).catch(console.log);

                window.electronAPI.sendOffer({ sdp: of.sdp, type: of.type });

                pc.onicecandidate = event => {
                    console.log({ c: event.candidate })
                    if (!event.candidate) return;

                    window.electronAPI.sendIceCandidate(event.candidate.toJSON());
                }

                window.electronAPI.handleDescription(async (ds) => {
                    console.log({ ds })
                    await pc.setRemoteDescription(new RTCSessionDescription(ds)).catch(console.log);
                })


                window.electronAPI.handleIceCandidate(async (ic) => {
                    console.log({ ic })
                    await pc.addIceCandidate(new RTCIceCandidate(ic)).catch(console.log);
                })

                // pc.ontrack = event => {
                //     console.log({trac: event.track})
                //     event.streams[0].getTracks().forEach(track => stream.addTrack(track));
                // }


                for (const track of s.getTracks()) {
                    console.log({ track })
                    pc.addTrack(track);
                }

                

            }

            const cont = document.createElement('div')
            cont.append(shareYt, youtubeLink)
            c.append(cont)

            cont.style.cssText = `
            display: flex;
            flex-direction: column-reverse;
            gap: 10px;
        `

            const shareFacebook = document.createElement('button')
            const fblink = document.createElement('input')
            shareFacebook.textContent = 'Share To Facebook'

            shareFacebook.onclick = async () => {
                window.electronAPI.startShare(fblink.value);


                const pc = new RTCPeerConnection({
                    iceServers: [
                        {
                            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
                        }
                    ]
                });


                const of = await pc.createOffer();
                await pc.setLocalDescription(of);

                window.electronAPI.sendOffer({ sdp: of.sdp, type: of.type });

                pc.onicecandidate = event => {
                    if (!event.candidate) return;

                    window.electronAPI.sendIceCandidate(event.candidate.toJSON());
                }

                window.electronAPI.handleDescription(async (ds) => {
                    console.log({ ds })
                    await pc.setRemoteDescription(new RTCSessionDescription(ds));
                })


                window.electronAPI.handleIceCandidate(async (ic) => {
                    console.log({ ic })
                    await pc.addIceCandidate(new RTCIceCandidate(ic));
                })

                pc.ontrack = event => {
                    event.streams[0].getTracks().forEach(track => stream.addTrack(track));
                }


                for (const track of s.getTracks()) {
                    pc.addTrack(track);
                }


            }

            const cont1 = document.createElement('div')
            cont1.append(shareFacebook, fblink)
            c.append(cont1)

            cont1.style.cssText = `
                display: flex;
                flex-direction: column-reverse;
                gap: 10px;
            `

            mediaRecorder.start(1000);
        }
    }

}, 1000);

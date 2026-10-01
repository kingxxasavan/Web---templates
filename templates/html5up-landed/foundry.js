// Demo forms validate locally; connect your own form service before publishing.
document.querySelectorAll('form').forEach(form => {
 form.addEventListener('submit', event => { event.preventDefault(); if(!form.reportValidity())return; let status=form.querySelector('.foundry-demo-status');if(!status){status=document.createElement('p');status.className='foundry-demo-status';status.setAttribute('role','status');form.append(status);}status.textContent='Demo only: no message or email was sent. Connect a form service before publishing your website.'; });
});

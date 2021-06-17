const create = document.getElementById('name')
const submit = document.getElementById('submit')

submit.addEventListener('click',function(e){
    if(create.value === "")return
    window.location.href = "/meeting"
})
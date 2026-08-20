document
.getElementById("loginForm")
.addEventListener("submit",(e)=>{

    e.preventDefault();

    const email =
    document.getElementById("loginEmail").value;

    const password =
    document.getElementById("loginPassword").value;

    console.log(email,password);

    alert("Login API will be connected later");

});
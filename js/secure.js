document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.getElementById("secure-password");
    const checkBtn = document.getElementById("secure-check");
    const secureArea = document.getElementById("secure-area");
    const logoutBtn = document.getElementById("logout-btn");
  
    const correctPassword = "aurora2025";
  
    checkBtn.addEventListener("click", () => {
      const entered = passwordInput.value.trim();
  
      if (entered === correctPassword) {
        secureArea.hidden = false;
        passwordInput.value = "";
        passwordInput.disabled = true;
        checkBtn.disabled = true;
      } else {
        alert("Wrong password! Try again.");
      }
    });
  
    logoutBtn.addEventListener("click", () => {
      secureArea.hidden = true;
      passwordInput.disabled = false;
      checkBtn.disabled = false;
      passwordInput.value = "";
    });
  });
  
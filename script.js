import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
// --- NEW: Added 'sendEmailVerification' to the import list below ---
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, query, orderBy, deleteDoc, where, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

//FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDzSxbvPdtxUaFgnUu8IDdeQ_c56eWZOFw",
  authDomain: "senior-s-legacy-3ced0.firebaseapp.com",
  projectId: "senior-s-legacy-3ced0",
  storageBucket: "senior-s-legacy-3ced0.firebasestorage.app",
  messagingSenderId: "667412226538",
  appId: "1:667412226538:web:e9a71555171ebcb38f5293"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

//page detectors
const isLoginPage = document.getElementById("actionBtn") !== null;
const isHomePage = document.getElementById("profileBtn") !== null;

//Login page index file
if (isLoginPage) {
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("passwordInput");
    const formTitle = document.getElementById("formTitle");
    const actionBtn = document.getElementById("actionBtn");
    const questionText = document.getElementById("questionText");
    const toggleLink = document.getElementById("toggleLink");
    const messageBox = document.getElementById("message");
    
    const usernameGroup = document.getElementById("usernameGroup");
    const usernameInput = document.getElementById("usernameInput");
    
    const usernameFeedback = document.getElementById("usernameFeedback");
    let usernameTypingTimer; 

    let isLoginMode = false; 

    usernameInput.addEventListener("input", (e) => {
        clearTimeout(usernameTypingTimer);
        const nickname = e.target.value.trim();

        if (!nickname) {
            usernameFeedback.style.color = "#b2bec3";
            usernameFeedback.innerText = "Must have numeric, small letter, capital letter, and one special character (@, #, $, &, -, _). 3-15 chars, no spaces.";
            return;
        }

        const nicknameRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$&-_])[A-Za-z\d@#$&-_]{3,15}$/;
        if (!nicknameRegex.test(nickname)) {
            usernameFeedback.style.color = "#ff4757";
            usernameFeedback.innerText = "❌ Missing capital, small, numeric, or special char. No spaces allowed.";
            return;
        }

        usernameFeedback.style.color = "#667eea";
        usernameFeedback.innerText = "Checking availability...";

        usernameTypingTimer = setTimeout(async () => {
            try {
                const q = query(collection(db, "users"), where("nickname", "==", nickname));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    usernameFeedback.style.color = "#ff4757";
                    usernameFeedback.innerText = "❌ Username already taken!";
                } else {
                    usernameFeedback.style.color = "#2ed573";
                    usernameFeedback.innerText = "✅ Username available!";
                }
            } catch (error) {
                usernameFeedback.style.color = "#ff4757";
                usernameFeedback.innerText = "❌ Error checking availability.";
            }
        }, 500); 
    });

    togglePassword.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        togglePassword.innerText = type === "password" ? "👁️" : "🙈";
    });

    toggleLink.addEventListener("click", () => {
        isLoginMode = !isLoginMode; 
        messageBox.innerText = ""; 

        usernameInput.value = "";
        usernameFeedback.style.color = "#b2bec3";
        usernameFeedback.innerText = "Must have numeric, small letter, capital letter, and one special character (@, #, $, &, -, _). 3-15 chars, no spaces.";

        if (isLoginMode) {
            formTitle.innerText = "Welcome Back";
            actionBtn.innerText = "Login";
            questionText.innerText = "Need an account?";
            toggleLink.innerText = "Sign Up here";
            usernameGroup.style.display = "none"; 
        } else {
            formTitle.innerText = "Join Senior's Legacy";
            actionBtn.innerText = "Sign Up";
            questionText.innerText = "Already signed up?";
            toggleLink.innerText = "Login here";
            usernameGroup.style.display = "block"; 
        }
    });

    actionBtn.addEventListener("click", async () => {
        const email = document.getElementById("emailInput").value.trim();
        const password = passwordInput.value.trim();
        const nickname = usernameInput.value.trim();

        const emailRegex = /^2\d00\d{7}[a-zA-Z0-9._-]+@dcrustm\.org$/i;
        
        if (!emailRegex.test(email)) {
            messageBox.style.color = "#ff4757";
            messageBox.innerText = "Error: Invalid university email.";
            return;
        }

        const batchYear = parseInt(email.substring(0, 2)); 
        const currentYearSuffix = parseInt(new Date().getFullYear().toString().slice(-2)); 
        
        if (batchYear < (currentYearSuffix - 5) || batchYear > currentYearSuffix) {
            messageBox.style.color = "#ff4757";
            messageBox.innerText = "Error: Invalid university email.";
            return;
        }
        
        if (!isLoginMode) {
            if (!nickname) {
                messageBox.style.color = "#ff4757";
                messageBox.innerText = "Please provide a Nickname.";
                return;
            }

            const nicknameRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$&-_])[A-Za-z\d@#$&-_]{3,15}$/;
            if (!nicknameRegex.test(nickname)) {
                messageBox.style.color = "#ff4757";
                messageBox.innerText = "Error: Nickname must have upper, lower, number, and special char (@, #, $, &, -, _).";
                return;
            }
            
            if (usernameFeedback.innerText.includes("taken") || usernameFeedback.innerText.includes("❌")) {
                messageBox.style.color = "#ff4757";
                messageBox.innerText = "Please fix your username before signing up.";
                return;
            }
        }

        messageBox.style.color = "#2d3436";
        messageBox.innerText = "Processing...";

        if (isLoginMode) {
            signInWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    // --- NEW: EMAIL VERIFICATION CHECK ON LOGIN ---
                    if (!userCredential.user.emailVerified) {
                        await signOut(auth); // Kick them back out!
                        messageBox.style.color = "#ff4757";
                        messageBox.innerText = "Access Denied: Please check your email inbox and verify your link first!";
                        return;
                    }
                    // ----------------------------------------------
                    
                    messageBox.style.color = "#2ed573";
                    messageBox.innerText = "Successfully logged in!";
                    window.location.href = "home.html";
                })
                .catch(() => {
                    messageBox.style.color = "#ff4757";
                    messageBox.innerText = "Invalid email or password. Please try again.";
                });
        } else {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@\-_&]).{8,}$/;
            if (!passwordRegex.test(password)) {
                messageBox.style.color = "#ff4757";
                messageBox.innerText = "Password must be at least 8 characters, incl. 1 uppercase, 1 lowercase, 1 number, and 1 special char (@, -, _, &).";
                return;
            }

            const rollNumber = email.substring(0, 11);
            const batchYearStr = rollNumber.substring(0, 2); 
            
            const currentDate = new Date();
            let currentYear = currentDate.getFullYear();
            let currentMonth = currentDate.getMonth();   
            let firstYearAdmissionYear = currentYear;
            if (currentMonth < 6) firstYearAdmissionYear = currentYear - 1;
            
            const firstYearPrefix = firstYearAdmissionYear.toString().slice(-2);
            let userRole = "senior"; 
            if (parseInt(batchYearStr) >= parseInt(firstYearPrefix)) userRole = "junior";

            createUserWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    await setDoc(doc(db, "users", userCredential.user.uid), {
                        email: userCredential.user.email,
                        role: userRole,
                        rollNumber: rollNumber,
                        nickname: nickname, 
                        createdAt: new Date()
                    });
                    
                    // --- NEW: SEND THE VERIFICATION LINK ---
                    await sendEmailVerification(userCredential.user);
                    await signOut(auth); // Log them out immediately so they can't sneak in
                    
                    messageBox.style.color = "#2ed573";
                    messageBox.innerText = "Success! We sent a verification link to your university email. (Note: Please check your Spam or Junk folder if you don't see it!)";
                    
                    // Automatically switch the UI back to Login Mode so they are ready
                    setTimeout(() => { toggleLink.click(); }, 3000); 
                    // ---------------------------------------
                })
                .catch((error) => {
                    messageBox.style.color = "#ff4757";
                    if (error.code === 'auth/email-already-in-use') {
                        messageBox.innerText = "This email is already registered. Try logging in!";
                    } else {
                        messageBox.innerText = error.message;
                    }
                });
        }
    });
}

//home page logic home file
if (isHomePage) {
    const writeAdviceBtn = document.getElementById("writeAdviceBtn");
    const profileBtn = document.getElementById("profileBtn");
    const categoryBtns = document.querySelectorAll(".category-btn");
    const feedContainer = document.getElementById("feedContainer");
    
    const viewPostModal = document.getElementById("viewPostModal");
    const closeViewModalBtn = document.getElementById("closeViewModalBtn");
    const fullPostContent = document.getElementById("fullPostContent");

    const profileModal = document.getElementById("profileModal");
    const closeProfileBtn = document.getElementById("closeProfileBtn");
    const actualLogoutBtn = document.getElementById("actualLogoutBtn");
    const profileNicknameDisplay = document.getElementById("profileNicknameDisplay");
    const profileEmailDisplay = document.getElementById("profileEmailDisplay");
    const myPostsContainer = document.getElementById("myPostsContainer");

    const searchUserInput = document.getElementById("searchUserInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    const searchToggleBtn = document.getElementById("searchToggleBtn");
    const searchContainer = document.getElementById("searchContainer");
    let activeSearchQuery = "";

    let selectedCategory = "All";
    let currentUserNickname = "Senior"; 

    const editProfileBtn = document.getElementById("editProfileBtn");
    const editProfileForm = document.getElementById("editProfileForm");
    const profileActionButtons = document.getElementById("profileActionButtons");
    const editNicknameInput = document.getElementById("editNicknameInput");
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const editFeedback = document.getElementById("editFeedback");

    const homeBtn = document.getElementById("homeBtn");
    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            searchContainer.style.display = "none";
            searchUserInput.value = "";
            activeSearchQuery = "";
            if(clearSearchBtn) clearSearchBtn.style.display = "none";

            categoryBtns.forEach(b => b.classList.remove("active"));
            categoryBtns[0].classList.add("active"); 
            selectedCategory = "All";

            window.scrollTo(0, 0);

            loadPosts("All");
        });
    }

    if (searchToggleBtn) {
        searchToggleBtn.addEventListener("click", () => {
            if (searchContainer.style.display === "none") {
                searchContainer.style.display = "flex";
                searchUserInput.focus(); 
            } else {
                searchContainer.style.display = "none";
                searchUserInput.value = "";
                activeSearchQuery = "";
                clearSearchBtn.style.display = "none";
                loadPosts(selectedCategory);
            }
        });
    }

    searchUserInput.addEventListener("input", (e) => {
        let val = e.target.value.trim().toLowerCase();
        if (val.startsWith("@")) val = val.substring(1);
        
        activeSearchQuery = val;

        if (activeSearchQuery.length > 0) {
            clearSearchBtn.style.display = "block";
        } else {
            clearSearchBtn.style.display = "none";
        }
        
        loadPosts(selectedCategory); 
    });

    clearSearchBtn.addEventListener("click", () => {
        searchUserInput.value = "";
        activeSearchQuery = "";
        clearSearchBtn.style.display = "none";
        loadPosts(selectedCategory);
    });

    // Loading main feed
    async function loadPosts(categoryFilter) {
        feedContainer.innerHTML = '<h3 style="color: #a4b0be; text-align:center;">Loading advice...</h3>';
        try {
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            feedContainer.innerHTML = ""; 
            let postsCount = 0;

            querySnapshot.forEach((docSnap) => {
                const post = docSnap.data();
                const postId = docSnap.id; 
                const displayName = post.authorName ? post.authorName : post.authorEmail.split('@')[0];
                
                if (activeSearchQuery !== "") {
                    if (!displayName.toLowerCase().includes(activeSearchQuery)) {
                        return; 
                    }
                }

                if (post.categories && post.categories.includes(categoryFilter)) {
                    postsCount++;
                    
                    const date = post.createdAt ? post.createdAt.toDate().toLocaleDateString() : "Just now";
                    
                    let mediaHtml = '';
                    let fullMediaHtml = '';
                    if (post.mediaUrl) {
                        if (post.mediaType === 'video') {
                            mediaHtml = `<video class="post-media" src="${post.mediaUrl}"></video>`;
                            fullMediaHtml = `<video class="full-post-media" src="${post.mediaUrl}" controls></video>`;
                        } else if (post.mediaType === 'pdf') {
                            mediaHtml = `<div style="margin:15px 0; padding:15px; background:#f1e4ff; border-radius:12px; color:#764ba2; font-weight:bold; text-align:center;">📄 View Attached PDF</div>`;
                            fullMediaHtml = `<a href="${post.mediaUrl}" target="_blank" style="display:block; margin: 15px 0; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; border-radius: 16px; font-weight: bold; text-decoration: none; box-shadow: 0 8px 20px rgba(118, 75, 162, 0.25);">📄 Click to open Full PDF</a>`;
                        } else {
                            mediaHtml = `<img class="post-media" src="${post.mediaUrl}" alt="Post image">`;
                            fullMediaHtml = `<img class="full-post-media" src="${post.mediaUrl}" alt="Post image">`;
                        }
                    }

                    const postCard = document.createElement("div");
                    postCard.className = "post-card";
                    postCard.innerHTML = `
                        <div class="post-header">
                            <strong>${displayName}</strong> 
                            <span class="post-date">${date}</span>
                        </div>
                        <div class="post-text">${post.text.length > 100 ? post.text.substring(0, 100) + '...' : post.text}</div>
                        ${mediaHtml}
                        <div class="post-tags">
                            ${post.categories.map(cat => cat !== "All" ? `<span class="tag">#${cat}</span>` : "").join("")}
                        </div>
                    `;

                    postCard.addEventListener("click", () => {
                        let deleteBtnHtml = "";
                        if (auth.currentUser && auth.currentUser.email === post.authorEmail) {
                            deleteBtnHtml = `<button id="deleteFeedPostBtn" style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); color: white; border: none; padding: 12px; border-radius: 12px; cursor: pointer; margin-top: 20px; width: 100%; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3);">🗑️ Delete Post</button>`;
                        }

                        fullPostContent.innerHTML = `
                            <div class="post-header">
                                <strong>${displayName}</strong> 
                                <span class="post-date">${date}</span>
                            </div>
                            <div class="post-text" style="font-size: 18px;">${post.text}</div>
                            ${fullMediaHtml}
                            <div class="post-tags" style="margin-top: 15px;">
                                ${post.categories.map(cat => cat !== "All" ? `<span class="tag">#${cat}</span>` : "").join("")}
                            </div>
                            ${deleteBtnHtml}
                        `;
                        viewPostModal.style.display = "flex";

                        const deleteBtn = document.getElementById("deleteFeedPostBtn");
                        if (deleteBtn) {
                            deleteBtn.addEventListener("click", async () => {
                                if (confirm("Are you sure you want to permanently delete this advice?")) {
                                    deleteBtn.innerText = "Deleting...";
                                    try {
                                        await deleteDoc(doc(db, "posts", postId)); 
                                        viewPostModal.style.display = "none";
                                        loadPosts(selectedCategory); 
                                    } catch (error) {
                                        console.error("Error deleting post:", error);
                                        alert("Failed to delete post. Check console.");
                                    }
                                }
                            });
                        }
                    });

                    feedContainer.appendChild(postCard);
                }
            });

            if (postsCount === 0) {
                if (activeSearchQuery !== "") {
                    feedContainer.innerHTML = `<h3 style="color: #a4b0be; text-align:center;">No posts found for user @${activeSearchQuery}.</h3>`;
                } else {
                    feedContainer.innerHTML = `<h3 style="color: #a4b0be; text-align:center;">No advice in ${categoryFilter} yet. Be the first!</h3>`;
                }
            }
        } catch (error) {
            console.error("Error loading posts:", error);
            feedContainer.innerHTML = '<h3 style="color: #ff4757; text-align:center;">Failed to load feed. Check console.</h3>';
        }
    }

    closeViewModalBtn.addEventListener("click", () => {
        viewPostModal.style.display = "none";
    });

    categoryBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            categoryBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedCategory = btn.innerText;
            loadPosts(selectedCategory);
        });
    });

    //authentication guard & nickname
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // --- NEW: EXTRA BOUNCER CHECK FOR THE HOMEPAGE ---
            if (!user.emailVerified) {
                await signOut(auth);
                window.location.href = "index.html";
                return;
            }
            // -------------------------------------------------
            
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                let role = "junior";

                if (docSnap.exists()) {
                    role = docSnap.data().role;
                    currentUserNickname = docSnap.data().nickname || docSnap.data().rollNumber; 
                } else {
                    const rollNumber = user.email.substring(0, 11);
                    currentUserNickname = rollNumber; 
                    const batchYear = rollNumber.substring(0, 2); 
                    const currentDate = new Date();
                    let currentYear = currentDate.getFullYear();
                    let currentMonth = currentDate.getMonth();   
                    let firstYearAdmissionYear = currentYear;
                    if (currentMonth < 6) firstYearAdmissionYear = currentYear - 1;
                    
                    const firstYearPrefix = firstYearAdmissionYear.toString().slice(-2);
                    if (parseInt(batchYear) < parseInt(firstYearPrefix)) {
                        role = "senior";
                    }

                    await setDoc(docRef, {
                        email: user.email,
                        role: role,
                        rollNumber: rollNumber,
                        nickname: currentUserNickname,
                        createdAt: new Date()
                    });
                }

                if (role === "senior") writeAdviceBtn.style.visibility = "visible";
                loadPosts("All");

            } catch (error) {
                console.error("Error fetching user role:", error);
                writeAdviceBtn.style.visibility = "visible"; 
                loadPosts("All");
            }
        } else {
            window.location.href = "index.html";
        }
    });

    //profile model logic
    profileBtn.addEventListener("click", () => {
        profileModal.style.display = "flex";
        profileNicknameDisplay.innerText = currentUserNickname;
        profileEmailDisplay.innerText = auth.currentUser.email;
        
        cancelEditBtn.click();
        
        loadMyPosts(); 
    });

    closeProfileBtn.addEventListener("click", () => {
        profileModal.style.display = "none";
    });

    actualLogoutBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to log out?")) signOut(auth);
    });

    editProfileBtn.addEventListener("click", () => {
        profileNicknameDisplay.style.display = "none";
        profileActionButtons.style.display = "none";
        editProfileForm.style.display = "flex";
        
        editNicknameInput.value = currentUserNickname;
        editFeedback.style.color = "#a4b0be";
        editFeedback.innerText = "Must have numeric, small, capital, and special char (@#$&-_). 3-15 chars, no spaces.";
    });

    cancelEditBtn.addEventListener("click", () => {
        profileNicknameDisplay.style.display = "block";
        profileActionButtons.style.display = "flex";
        editProfileForm.style.display = "none";
    });

    saveProfileBtn.addEventListener("click", async () => {
        const newNickname = editNicknameInput.value.trim();
        
        if (newNickname === currentUserNickname) {
            cancelEditBtn.click();
            return;
        }

        const nicknameRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$&-_])[A-Za-z\d@#$&-_]{3,15}$/;
        if (!nicknameRegex.test(newNickname)) {
            editFeedback.style.color = "#ff4757";
            editFeedback.innerText = "❌ Missing capital, small, numeric, or special char. No spaces allowed.";
            return;
        }

        editFeedback.style.color = "#667eea";
        editFeedback.innerText = "Checking availability & updating...";
        saveProfileBtn.disabled = true;

        try {
            const q = query(collection(db, "users"), where("nickname", "==", newNickname));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                editFeedback.style.color = "#ff4757";
                editFeedback.innerText = "❌ Username already taken!";
                saveProfileBtn.disabled = false;
                return;
            }

            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                nickname: newNickname
            });

            const postsQuery = query(collection(db, "posts"), where("authorEmail", "==", auth.currentUser.email));
            const postsSnapshot = await getDocs(postsQuery);
            
            postsSnapshot.forEach(async (postDoc) => {
                await updateDoc(doc(db, "posts", postDoc.id), {
                    authorName: newNickname
                });
            });

            currentUserNickname = newNickname;
            profileNicknameDisplay.innerText = currentUserNickname;
            
            cancelEditBtn.click(); 
            loadPosts(selectedCategory); 
            loadMyPosts(); 
            
        } catch (error) {
            console.error("Error updating profile:", error);
            editFeedback.style.color = "#ff4757";
            editFeedback.innerText = "❌ Error saving profile. Check console.";
        }
        
        saveProfileBtn.disabled = false;
    });

    async function loadMyPosts() {
        myPostsContainer.innerHTML = '<p style="color: #a4b0be; text-align: center;">Loading your posts...</p>';
        try {
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            
            myPostsContainer.innerHTML = ""; 
            let myCount = 0;

            querySnapshot.forEach((docSnap) => {
                const post = docSnap.data();
                const postId = docSnap.id;
                
                if (post.authorEmail === auth.currentUser.email) {
                    myCount++;
                    const date = post.createdAt ? post.createdAt.toDate().toLocaleDateString() : "Just now";
                    
                    let mediaHtml = '';
                    if (post.mediaUrl) {
                        if (post.mediaType === 'video') mediaHtml = `<video class="post-media" src="${post.mediaUrl}"></video>`;
                        else if (post.mediaType === 'pdf') mediaHtml = `<div style="margin:10px 0; padding:10px; background:#f1e4ff; border-radius:12px; color:#764ba2; font-weight:bold; text-align:center;">📄 Attached PDF</div>`;
                        else mediaHtml = `<img class="post-media" src="${post.mediaUrl}" alt="Post image">`;
                    }

                    const postCard = document.createElement("div");
                    postCard.className = "post-card";
                    postCard.style.cursor = "default"; 
                    postCard.innerHTML = `
                        <div class="post-header">
                            <strong>${date}</strong> 
                        </div>
                        <div class="post-text">${post.text}</div>
                        ${mediaHtml}
                        <button class="delete-my-post-btn" style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); color: white; border: none; padding: 8px 12px; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 14px; margin-top: 10px; width: 100%; box-shadow: 0 4px 10px rgba(255, 71, 87, 0.2);">🗑️ Delete</button>
                    `;

                    const deleteBtn = postCard.querySelector('.delete-my-post-btn');
                    deleteBtn.addEventListener('click', async () => {
                        if (confirm("Are you sure you want to permanently delete this advice?")) {
                            deleteBtn.innerText = "Deleting...";
                            try {
                                await deleteDoc(doc(db, "posts", postId));
                                loadMyPosts(); 
                                loadPosts(selectedCategory); 
                            } catch (err) {
                                console.error(err);
                                alert("Failed to delete.");
                                deleteBtn.innerText = "🗑️ Delete";
                            }
                        }
                    });

                    myPostsContainer.appendChild(postCard);
                }
            });

            if (myCount === 0) {
                myPostsContainer.innerHTML = `<p style="color: #a4b0be; text-align: center; font-weight:bold;">You haven't posted anything yet.</p>`;
            }
        } catch (error) {
            console.error(error);
            myPostsContainer.innerHTML = '<p style="color: #ff4757; text-align: center;">Failed to load posts.</p>';
        }
    }


    //model and posting logic
    const postModal = document.getElementById("postModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const submitPostBtn = document.getElementById("submitPostBtn");
    const postTextarea = document.getElementById("postTextarea");
    const uploadFileBtn = document.getElementById("uploadFileBtn");
    const fileInput = document.getElementById("fileInput");
    const fileNameDisplay = document.getElementById("fileNameDisplay");

    writeAdviceBtn.addEventListener("click", () => postModal.style.display = "flex");

    closeModalBtn.addEventListener("click", () => {
        postModal.style.display = "none";
        postTextarea.value = "";
        fileInput.value = "";
        fileNameDisplay.innerText = "";
    });

    uploadFileBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.innerText = fileInput.files[0].name;
        }
    });

    submitPostBtn.addEventListener("click", async () => {
        const text = postTextarea.value.trim();
        if (!text && fileInput.files.length === 0) {
            alert("Please write some advice or attach a file before posting!");
            return;
        }

        let mediaUrl = null;
        let mediaType = null;

        try {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                submitPostBtn.innerText = "Uploading File...";
                
                const cloudName = "dnmmkwbjr"; 
                const uploadPreset = "ml_default"; 

                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", uploadPreset);

                const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                    method: 'POST',
                    body: formData
                });

                const cloudData = await cloudinaryResponse.json();

                if (cloudData.error) {
                    throw new Error(cloudData.error.message);
                }

                mediaUrl = cloudData.secure_url;
                
                if (file.type.startsWith('video/')) {
                    mediaType = 'video';
                } else if (file.type === 'application/pdf') {
                    mediaType = 'pdf';
                } else {
                    mediaType = 'image';
                }
            }

            submitPostBtn.innerText = "Saving Post...";

            let postCategories = ["All"]; 
            const textLower = text.toLowerCase();
            if (textLower.includes("#department")) postCategories.push("Department");
            if (textLower.includes("#library")) postCategories.push("Library");
            if (textLower.includes("#secretplaces")) postCategories.push("Secret Places");
            if (textLower.includes("#campus")) postCategories.push("Campus");

            await addDoc(collection(db, "posts"), {
                text: text,
                categories: postCategories,
                authorEmail: auth.currentUser.email,
                authorName: currentUserNickname, 
                createdAt: new Date(),
                mediaUrl: mediaUrl,
                mediaType: mediaType
            });
            
            postModal.style.display = "none";
            postTextarea.value = "";
            fileInput.value = "";
            fileNameDisplay.innerText = "";
            submitPostBtn.innerText = "Post";
            
            loadPosts(selectedCategory);
            
        } catch (error) {
            console.error("Error: ", error);
            alert("Failed to post. Check console.");
            submitPostBtn.innerText = "Post";
        }
    });
}
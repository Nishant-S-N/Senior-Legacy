import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
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
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
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
            if(forgotPasswordLink) forgotPasswordLink.style.display = "inline-block"; // SHOW
        } else {
            formTitle.innerText = "Join Senior's Legacy";
            actionBtn.innerText = "Sign Up";
            questionText.innerText = "Already signed up?";
            toggleLink.innerText = "Login here";
            usernameGroup.style.display = "block"; 
            if(forgotPasswordLink) forgotPasswordLink.style.display = "none";
        }
    });

    //Forgot Password Button Logic
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", async () => {
            const email = document.getElementById("emailInput").value.trim();
            if (!email) {
                messageBox.style.color = "#ff4757";
                messageBox.innerText = "Please enter your university email in the box first to reset your password.";
                return;
            }
            
            messageBox.style.color = "#2d3436";
            messageBox.innerText = "Sending password reset link...";

            try {
                await sendPasswordResetEmail(auth, email);
                messageBox.style.color = "#2ed573";
                messageBox.innerText = "Password reset link sent! Please check your university email (and Spam folder).";
            } catch (error) {
                console.error("Reset Error:", error);
                messageBox.style.color = "#ff4757";
                messageBox.innerText = "Error: Could not send link. Ensure this email is registered.";
            }
        });
    }

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
            
            let firstYearPrefix = new Date().getFullYear().toString().slice(-2);
            if (new Date().getMonth() < 6) firstYearPrefix = (new Date().getFullYear() - 1).toString().slice(-2);
            
            let userRole = parseInt(batchYearStr) >= parseInt(firstYearPrefix) ? "junior" : "senior";

            createUserWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    await setDoc(doc(db, "users", userCredential.user.uid), {
                        email: userCredential.user.email,
                        role: userRole,
                        rollNumber: rollNumber,
                        nickname: nickname,
                        bio: "No bio yet.", 
                        profilePic: null, 
                        createdAt: new Date()
                    });
                    
                    await sendEmailVerification(userCredential.user);
                    await signOut(auth); 
                    
                    messageBox.style.color = "#2ed573";
                    messageBox.innerText = "Success! We sent a verification link to your university email. (Note: Check your Spam folder!)";
                    
                    setTimeout(() => { toggleLink.click(); }, 3000); 
                })
                .catch((error) => {
                    messageBox.style.color = "#ff4757";
                    messageBox.innerText = error.code === 'auth/email-already-in-use' ? "Email already registered. Try logging in!" : error.message;
                });
        }
    });
}

//home page logic
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
    const profileBioDisplay = document.getElementById("profileBioDisplay"); 
    const myPostsContainer = document.getElementById("myPostsContainer");

    const searchUserInput = document.getElementById("searchUserInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    const searchToggleBtn = document.getElementById("searchToggleBtn");
    const searchContainer = document.getElementById("searchContainer");
    
    let activeSearchQuery = "";
    let selectedCategory = "All";
    let currentUserNickname = "Senior"; 
    let currentUserBio = "No bio yet."; 
    let currentUserProfilePic = null; 
    let currentViewingPostId = null; 

    const editProfileBtn = document.getElementById("editProfileBtn");
    const editProfileForm = document.getElementById("editProfileForm");
    const profileActionButtons = document.getElementById("profileActionButtons");
    const editNicknameInput = document.getElementById("editNicknameInput");
    const editBioInput = document.getElementById("editBioInput"); 
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const editFeedback = document.getElementById("editFeedback");

    const homeBtn = document.getElementById("homeBtn");

    function getAvatarHtml(picUrl, displayName, size = 36) {
        if (picUrl) {
            return `<img src="${picUrl}" style="width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; margin-right: 12px; cursor: pointer; border: 1px solid #dfe6e9;" class="feed-avatar" data-username="${displayName}">`;
        } else {
            return `<div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; justify-content: center; align-items: center; font-size: ${size/1.8}px; margin-right: 12px; cursor: pointer; box-shadow: 0 2px 5px rgba(118, 75, 162, 0.2);" class="feed-avatar" data-username="${displayName}">👤</div>`;
        }
    }

    // Clickable Usernames
    function triggerProfileSearch(username) {
        viewPostModal.style.display = "none"; 
        searchContainer.style.display = "flex";
        searchUserInput.value = username;
        activeSearchQuery = username.toLowerCase();
        clearSearchBtn.style.display = "block";
        window.scrollTo(0, 0);
        selectedCategory = "All";
        categoryBtns.forEach(b => b.classList.remove("active"));
        categoryBtns[0].classList.add("active"); 
        loadPosts("All");
    }

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
        clearSearchBtn.style.display = activeSearchQuery.length > 0 ? "block" : "none";
        loadPosts(selectedCategory); 
    });

    clearSearchBtn.addEventListener("click", () => {
        searchUserInput.value = "";
        activeSearchQuery = "";
        clearSearchBtn.style.display = "none";
        loadPosts(selectedCategory);
    });

    // Loading main feed & Public Profile
    async function loadPosts(categoryFilter) {
        feedContainer.innerHTML = '<h3 style="color: #a4b0be; text-align:center;">Loading advice...</h3>';
        try {
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            
            let matchingPosts = [];
            let searchedUserDisplayName = activeSearchQuery;

            querySnapshot.forEach((docSnap) => {
                const post = docSnap.data();
                const postId = docSnap.id; 
                const displayName = post.authorName ? post.authorName : post.authorEmail.split('@')[0];
                
                if (activeSearchQuery !== "") {
                    if (!displayName.toLowerCase().includes(activeSearchQuery)) return;
                    if (displayName.toLowerCase() === activeSearchQuery.toLowerCase() || searchedUserDisplayName === activeSearchQuery) {
                        searchedUserDisplayName = displayName; 
                    }
                }

                if (post.categories && post.categories.includes(categoryFilter)) {
                    matchingPosts.push({ id: postId, post: post, displayName: displayName });
                }
            });

            feedContainer.innerHTML = ""; 

            if (matchingPosts.length === 0) {
                if (activeSearchQuery !== "") feedContainer.innerHTML = `<h3 style="color: #a4b0be; text-align:center;">No posts found for user @${activeSearchQuery}.</h3>`;
                else feedContainer.innerHTML = `<h3 style="color: #a4b0be; text-align:center;">No advice in ${categoryFilter} yet. Be the first!</h3>`;
                return;
            }

            if (activeSearchQuery !== "") {
                let publicBio = "No bio yet.";
                let publicProfilePic = null;
                try {
                    const userQ = query(collection(db, "users"), where("nickname", "==", searchedUserDisplayName));
                    const userSnap = await getDocs(userQ);
                    if (!userSnap.empty) {
                        publicBio = userSnap.docs[0].data().bio || "No bio yet.";
                        publicProfilePic = userSnap.docs[0].data().profilePic || null;
                    }
                } catch (err) {}

                let publicPicHtml = publicProfilePic 
                    ? `<img src="${publicProfilePic}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; margin: 0 auto 15px auto; display: block; border: 3px solid #6c5ce7; box-shadow: 0 4px 15px rgba(108, 92, 231, 0.2);">`
                    : `<div style="width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; justify-content: center; align-items: center; font-size: 50px; margin: 0 auto 15px auto; box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);">👤</div>`;

                const profileHeader = document.createElement("div");
                profileHeader.style.cssText = "text-align: center; padding: 25px 20px; background: white; border-radius: 24px; margin-bottom: 20px; box-shadow: 0px 8px 24px rgba(149, 157, 165, 0.1);";
                profileHeader.innerHTML = `
                    ${publicPicHtml}
                    <h2 style="margin: 0; color: #6c5ce7; font-weight: 700;">@${searchedUserDisplayName}</h2>
                    <p style="color: #636e72; font-size: 14px; margin: 15px 10px; font-style: italic; line-height: 1.4; white-space: pre-wrap;">${publicBio}</p>
                    <hr style="border: 0; border-top: 2px solid #f0f2f5; margin: 20px 0;">
                    <h3 style="text-align: left; margin-bottom: 0; color: #2d3436; font-weight: 800;">Posts</h3>
                `;
                feedContainer.appendChild(profileHeader);
            }

            // Render matching posts
            matchingPosts.forEach((item) => {
                const post = item.post;
                const postId = item.id;
                const displayName = item.displayName;
                const date = post.createdAt ? post.createdAt.toDate().toLocaleDateString() : "Just now";
                const avatarHtml = getAvatarHtml(post.authorProfilePic, displayName, 42);
                
                let mediaHtml = ''; let fullMediaHtml = '';
                if (post.mediaUrl) {
                    if (post.mediaType === 'video') {
                        mediaHtml = `<video class="post-media" src="${post.mediaUrl}"></video>`;
                        fullMediaHtml = `<video class="full-post-media" src="${post.mediaUrl}" controls></video>`;
                    } else if (post.mediaType === 'pdf') {
                        mediaHtml = `<div style="margin:15px 0; padding:15px; background:#f1e4ff; border-radius:12px; color:#764ba2; font-weight:bold; text-align:center;">📄 View Attached PDF</div>`;
                        fullMediaHtml = `<a href="${post.mediaUrl}" target="_blank" style="display:block; margin: 15px 0; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; border-radius: 16px; font-weight: bold; text-decoration: none;">📄 Click to open Full PDF</a>`;
                    } else {
                        mediaHtml = `<img class="post-media" src="${post.mediaUrl}" alt="Post image">`;
                        fullMediaHtml = `<img class="full-post-media" src="${post.mediaUrl}" alt="Post image">`;
                    }
                }

                const postCard = document.createElement("div");
                postCard.className = "post-card";
                postCard.innerHTML = `
                    <div class="post-header" style="display: flex; align-items: center; justify-content: flex-start; gap: 4px; margin-bottom: 12px;">
                        ${avatarHtml}
                        <div style="display: flex; flex-direction: column; flex-grow: 1;">
                            <strong class="feed-username" data-username="${displayName}">${displayName}</strong> 
                            <span class="post-date" style="margin-top: 2px;">${date}</span>
                        </div>
                    </div>
                    <div class="post-text">${post.text.length > 100 ? post.text.substring(0, 100) + '...' : post.text}</div>
                    ${mediaHtml}
                    <div class="post-tags">
                        ${(post.categories || []).map(cat => cat !== "All" ? `<span class="tag">#${cat}</span>` : "").join("")}
                    </div>
                    <div style="border-top: 2px solid #f0f2f5; margin-top: 15px; padding-top: 12px; color: #a4b0be; font-size: 13px; font-weight: 700; display: flex; align-items: center;">
                        💬 View Thread / Reply
                    </div>
                `;

                // Clickable Username (Feed)
                postCard.querySelectorAll('.feed-username, .feed-avatar').forEach(el => {
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        triggerProfileSearch(displayName);
                    });
                });

                postCard.addEventListener("click", () => {
                    let deleteBtnHtml = "";
                    if (auth.currentUser && auth.currentUser.email === post.authorEmail) {
                        deleteBtnHtml = `<button id="deleteFeedPostBtn" style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); color: white; border: none; padding: 12px; border-radius: 12px; cursor: pointer; margin-top: 20px; width: 100%; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3);">🗑️ Delete Main Post</button>`;
                    }

                    fullPostContent.innerHTML = `
                        <div class="post-header" style="display: flex; align-items: center; justify-content: flex-start; gap: 4px; margin-bottom: 12px;">
                            ${avatarHtml}
                            <div style="display: flex; flex-direction: column; flex-grow: 1;">
                                <strong class="feed-username" data-username="${displayName}">${displayName}</strong> 
                                <span class="post-date" style="margin-top: 2px;">${date}</span>
                            </div>
                        </div>
                        <div class="post-text" style="font-size: 18px;">${post.text}</div>
                        ${fullMediaHtml}
                        <div class="post-tags" style="margin-top: 15px;">${(post.categories || []).map(cat => cat !== "All" ? `<span class="tag">#${cat}</span>` : "").join("")}</div>
                        ${deleteBtnHtml}
                    `;

                    // Clickable Username (Inside Post)
                    fullPostContent.querySelectorAll('.feed-username, .feed-avatar').forEach(el => {
                        el.addEventListener('click', (e) => {
                            e.stopPropagation();
                            triggerProfileSearch(displayName);
                        });
                    });
                    
                    currentViewingPostId = postId;
                    loadComments(postId);
                    viewPostModal.style.display = "flex";

                    const deleteBtn = document.getElementById("deleteFeedPostBtn");
                    if (deleteBtn) {
                        deleteBtn.addEventListener("click", async () => {
                            if (confirm("Are you sure you want to permanently delete this advice?")) {
                                deleteBtn.innerText = "Deleting...";
                                await deleteDoc(doc(db, "posts", postId)); 
                                viewPostModal.style.display = "none";
                                currentViewingPostId = null;
                                loadPosts(selectedCategory); 
                            }
                        });
                    }
                });

                feedContainer.appendChild(postCard);
            });

        } catch (error) {
            console.error("Error loading posts:", error);
            feedContainer.innerHTML = '<h3 style="color: #ff4757; text-align:center;">Failed to load feed. Check console.</h3>';
        }
    }

    closeViewModalBtn.addEventListener("click", () => {
        viewPostModal.style.display = "none";
        currentViewingPostId = null;
    });

    categoryBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            categoryBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedCategory = btn.innerText;
            loadPosts(selectedCategory);
        });
    });

    //auth guard
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                let role = "junior";

                if (docSnap.exists()) {
                    role = docSnap.data().role;
                    currentUserNickname = docSnap.data().nickname || docSnap.data().rollNumber; 
                    currentUserBio = docSnap.data().bio || "No bio yet."; 
                    currentUserProfilePic = docSnap.data().profilePic || null; // Fetch Pic
                } else {
                    const rollNumber = user.email.substring(0, 11);
                    currentUserNickname = rollNumber; 
                    currentUserBio = "No bio yet.";
                    currentUserProfilePic = null;
                    
                    let firstYearPrefix = new Date().getFullYear().toString().slice(-2);
                    if (new Date().getMonth() < 6) firstYearPrefix = (new Date().getFullYear() - 1).toString().slice(-2);
                    if (parseInt(rollNumber.substring(0, 2)) < parseInt(firstYearPrefix)) role = "senior";

                    await setDoc(docRef, {
                        email: user.email,
                        role: role,
                        rollNumber: rollNumber,
                        nickname: currentUserNickname,
                        bio: currentUserBio,
                        profilePic: currentUserProfilePic,
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

    //PROFILE PICTURE UPLOAD & DELETE LOGIC
    const profilePicInput = document.getElementById("profilePicInput");
    const profilePicDisplay = document.getElementById("profilePicDisplay");
    const defaultAvatarDisplay = document.getElementById("defaultAvatarDisplay");
    const uploadingPicText = document.getElementById("uploadingPicText");
    const profileAvatarContainer = document.getElementById("profileAvatarContainer");
    const removeProfilePicBtn = document.getElementById("removeProfilePicBtn");

    function updateProfilePicUI(url) {
        if (url) {
            profilePicDisplay.src = url;
            profilePicDisplay.style.display = "inline-block";
            defaultAvatarDisplay.style.display = "none";
            if (removeProfilePicBtn) removeProfilePicBtn.style.display = "flex"; // Show Delete Btn
        } else {
            profilePicDisplay.style.display = "none";
            defaultAvatarDisplay.style.display = "flex"; 
            defaultAvatarDisplay.innerText = "👤";
            if (removeProfilePicBtn) removeProfilePicBtn.style.display = "none"; // Hide Delete Btn
        }
    }

    profileAvatarContainer.addEventListener("click", () => {
        profilePicInput.click();
    });

    // Delete Button Logic
    if (removeProfilePicBtn) {
        removeProfilePicBtn.addEventListener("click", async (e) => {
            e.stopPropagation(); // Stops the file upload window from opening!
            
            if (confirm("Are you sure you want to remove your profile picture?")) {
                uploadingPicText.style.display = "block";
                uploadingPicText.innerText = "Removing picture...";
                
                try {
                    await updateDoc(doc(db, "users", auth.currentUser.uid), {
                        profilePic: null
                    });

                    // Force update all old posts and comments
                    const postsQuery = query(collection(db, "posts"), where("authorEmail", "==", auth.currentUser.email));
                    const postsSnapshot = await getDocs(postsQuery);
                    postsSnapshot.forEach(async (postDoc) => {
                        await updateDoc(doc(db, "posts", postDoc.id), { authorProfilePic: null });
                    });

                    const commentsQuery = query(collection(db, "comments"), where("authorEmail", "==", auth.currentUser.email));
                    const commentsSnapshot = await getDocs(commentsQuery);
                    commentsSnapshot.forEach(async (commentDoc) => {
                        await updateDoc(doc(db, "comments", commentDoc.id), { authorProfilePic: null });
                    });

                    currentUserProfilePic = null;
                    updateProfilePicUI(null);
                    
                    loadPosts(selectedCategory);
                    loadMyPosts();
                    
                } catch (error) {
                    console.error("Error removing picture:", error);
                    alert("Failed to remove profile picture.");
                } finally {
                    uploadingPicText.style.display = "none";
                    uploadingPicText.innerText = "Uploading to server..."; // Reset text
                }
            }
        });
    }

    // Upload Button Logic
    profilePicInput.addEventListener("change", async () => {
        if (profilePicInput.files.length === 0) return;
        const file = profilePicInput.files[0];
        
        uploadingPicText.style.display = "block";
        uploadingPicText.innerText = "Uploading to server...";
        
        try {
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
            if (cloudData.error) throw new Error(cloudData.error.message);

            const newPicUrl = cloudData.secure_url;

            // Save to User Database
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                profilePic: newPicUrl
            });

            const postsQuery = query(collection(db, "posts"), where("authorEmail", "==", auth.currentUser.email));
            const postsSnapshot = await getDocs(postsQuery);
            postsSnapshot.forEach(async (postDoc) => {
                await updateDoc(doc(db, "posts", postDoc.id), { authorProfilePic: newPicUrl });
            });

            const commentsQuery = query(collection(db, "comments"), where("authorEmail", "==", auth.currentUser.email));
            const commentsSnapshot = await getDocs(commentsQuery);
            commentsSnapshot.forEach(async (commentDoc) => {
                await updateDoc(doc(db, "comments", commentDoc.id), { authorProfilePic: newPicUrl });
            });

            currentUserProfilePic = newPicUrl;
            updateProfilePicUI(currentUserProfilePic);
            
            loadPosts(selectedCategory);
            loadMyPosts();
            
        } catch (error) {
            console.error(error);
            alert("Failed to upload profile picture.");
        } finally {
            uploadingPicText.style.display = "none";
            profilePicInput.value = "";
        }
    });

    //profile logic
    profileBtn.addEventListener("click", () => {
        profileModal.style.display = "flex";
        profileNicknameDisplay.innerText = currentUserNickname;
        profileEmailDisplay.innerText = auth.currentUser.email;
        profileBioDisplay.innerText = currentUserBio; 
        
        updateProfilePicUI(currentUserProfilePic); 
        
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
        profileAvatarContainer.style.display = "none";
        profileNicknameDisplay.style.display = "none";
        profileEmailDisplay.style.display = "none";
        profileBioDisplay.style.display = "none";
        profileActionButtons.style.display = "none";
        editProfileForm.style.display = "flex";
        
        editNicknameInput.value = currentUserNickname;
        editBioInput.value = currentUserBio === "No bio yet." ? "" : currentUserBio; 
        
        editFeedback.style.color = "#a4b0be";
        editFeedback.innerText = "Must have numeric, small, capital, and special char (@#$&-_). 3-15 chars, no spaces.";
    });

    cancelEditBtn.addEventListener("click", () => {
        profileAvatarContainer.style.display = "inline-block";
        profileNicknameDisplay.style.display = "block";
        profileEmailDisplay.style.display = "block";
        profileBioDisplay.style.display = "block";
        profileActionButtons.style.display = "flex";
        editProfileForm.style.display = "none";
    });

    saveProfileBtn.addEventListener("click", async () => {
        const newNickname = editNicknameInput.value.trim();
        const newBio = editBioInput.value.trim();
        
        if (newNickname === currentUserNickname && newBio === (currentUserBio === "No bio yet." ? "" : currentUserBio)) {
            cancelEditBtn.click();
            return;
        }

        saveProfileBtn.disabled = true;

        if (newNickname !== currentUserNickname) {
            const nicknameRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$&-_])[A-Za-z\d@#$&-_]{3,15}$/;
            if (!nicknameRegex.test(newNickname)) {
                editFeedback.style.color = "#ff4757";
                editFeedback.innerText = "❌ Missing capital, small, numeric, or special char. No spaces allowed.";
                saveProfileBtn.disabled = false;
                return;
            }

            editFeedback.style.color = "#667eea";
            editFeedback.innerText = "Checking availability & updating...";

            try {
                const q = query(collection(db, "users"), where("nickname", "==", newNickname));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    editFeedback.style.color = "#ff4757";
                    editFeedback.innerText = "❌ Username already taken!";
                    saveProfileBtn.disabled = false;
                    return;
                }
            } catch(e) { console.error(e); }
        } else {
            editFeedback.style.color = "#667eea";
            editFeedback.innerText = "Updating profile...";
        }

        try {
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                nickname: newNickname,
                bio: newBio || "No bio yet." 
            });

            if (newNickname !== currentUserNickname) {
                const postsQuery = query(collection(db, "posts"), where("authorEmail", "==", auth.currentUser.email));
                const postsSnapshot = await getDocs(postsQuery);
                postsSnapshot.forEach(async (postDoc) => {
                    await updateDoc(doc(db, "posts", postDoc.id), { authorName: newNickname });
                });
                
                const commentsQuery = query(collection(db, "comments"), where("authorEmail", "==", auth.currentUser.email));
                const commentsSnapshot = await getDocs(commentsQuery);
                commentsSnapshot.forEach(async (commentDoc) => {
                    await updateDoc(doc(db, "comments", commentDoc.id), { authorName: newNickname });
                });
            }

            currentUserNickname = newNickname;
            currentUserBio = newBio || "No bio yet."; 
            profileNicknameDisplay.innerText = currentUserNickname;
            profileBioDisplay.innerText = currentUserBio;
            
            updateProfilePicUI(currentUserProfilePic);
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
                    const avatarHtml = getAvatarHtml(post.authorProfilePic, post.authorName || currentUserNickname, 42);
                    
                    let mediaHtml = ''; let fullMediaHtml = '';
                    if (post.mediaUrl) {
                        if (post.mediaType === 'video') {
                            mediaHtml = `<video class="post-media" src="${post.mediaUrl}"></video>`;
                            fullMediaHtml = `<video class="full-post-media" src="${post.mediaUrl}" controls></video>`;
                        } else if (post.mediaType === 'pdf') {
                            mediaHtml = `<div style="margin:10px 0; padding:10px; background:#f1e4ff; border-radius:12px; color:#764ba2; font-weight:bold; text-align:center;">📄 Attached PDF</div>`;
                            fullMediaHtml = `<a href="${post.mediaUrl}" target="_blank" style="display:block; margin: 15px 0; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; border-radius: 16px; font-weight: bold; text-decoration: none;">📄 Click to open Full PDF</a>`;
                        } else {
                            mediaHtml = `<img class="post-media" src="${post.mediaUrl}" alt="Post image">`;
                            fullMediaHtml = `<img class="full-post-media" src="${post.mediaUrl}" alt="Post image">`;
                        }
                    }

                    const postCard = document.createElement("div");
                    postCard.className = "post-card";
                    postCard.style.cursor = "pointer"; 
                    postCard.innerHTML = `
                        <div class="post-header">
                            <strong>${date}</strong> 
                        </div>
                        <div class="post-text">${post.text}</div>
                        ${mediaHtml}
                        <div style="border-top: 2px solid #f0f2f5; margin-top: 15px; padding-top: 12px; color: #a4b0be; font-size: 13px; font-weight: 700; display: flex; align-items: center;">💬 View Thread / Reply</div>
                        <button class="delete-my-post-btn" style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); color: white; border: none; padding: 8px 12px; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 14px; margin-top: 10px; width: 100%;">🗑️ Delete Post</button>
                    `;

                    postCard.addEventListener("click", (e) => {
                        if (e.target.classList.contains('delete-my-post-btn')) return;

                        let deleteBtnHtml = `<button id="deleteProfilePostBtn" style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); color: white; border: none; padding: 12px; border-radius: 12px; cursor: pointer; margin-top: 20px; width: 100%; font-weight: bold; font-size: 16px;">🗑️ Delete Main Post</button>`;

                        fullPostContent.innerHTML = `
                            <div class="post-header" style="display: flex; align-items: center; justify-content: flex-start; gap: 4px; margin-bottom: 12px;">
                                ${avatarHtml}
                                <div style="display: flex; flex-direction: column; flex-grow: 1;">
                                    <strong class="feed-username" data-username="${post.authorName || currentUserNickname}">${post.authorName || currentUserNickname}</strong> 
                                    <span class="post-date" style="margin-top: 2px;">${date}</span>
                                </div>
                            </div>
                            <div class="post-text" style="font-size: 18px;">${post.text}</div>
                            ${fullMediaHtml}
                            <div class="post-tags" style="margin-top: 15px;">${(post.categories || []).map(cat => cat !== "All" ? `<span class="tag">#${cat}</span>` : "").join("")}</div>
                            ${deleteBtnHtml}
                        `;
                        
                        fullPostContent.querySelectorAll('.feed-username, .feed-avatar').forEach(el => {
                            el.addEventListener('click', (e) => {
                                e.stopPropagation();
                                profileModal.style.display = "none"; 
                                triggerProfileSearch(post.authorName || currentUserNickname);
                            });
                        });

                        currentViewingPostId = postId;
                        loadComments(postId);
                        viewPostModal.style.display = "flex";

                        const deleteBtnModal = document.getElementById("deleteProfilePostBtn");
                        if (deleteBtnModal) {
                            deleteBtnModal.addEventListener("click", async () => {
                                if (confirm("Are you sure you want to permanently delete this advice?")) {
                                    deleteBtnModal.innerText = "Deleting...";
                                    await deleteDoc(doc(db, "posts", postId)); 
                                    viewPostModal.style.display = "none";
                                    currentViewingPostId = null;
                                    loadMyPosts(); 
                                    loadPosts(selectedCategory); 
                                }
                            });
                        }
                    });

                    const deleteBtnCard = postCard.querySelector('.delete-my-post-btn');
                    deleteBtnCard.addEventListener('click', async (e) => {
                        e.stopPropagation(); 
                        if (confirm("Are you sure you want to permanently delete this advice?")) {
                            deleteBtnCard.innerText = "Deleting...";
                            await deleteDoc(doc(db, "posts", postId));
                            loadMyPosts(); 
                            loadPosts(selectedCategory); 
                        }
                    });

                    myPostsContainer.appendChild(postCard);
                }
            });

            if (myCount === 0) myPostsContainer.innerHTML = `<p style="color: #a4b0be; text-align: center; font-weight:bold;">You haven't posted anything yet.</p>`;
        } catch (error) { console.error(error); }
    }

    //posting logic
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
        if (fileInput.files.length > 0) fileNameDisplay.innerText = fileInput.files[0].name;
    });

    submitPostBtn.addEventListener("click", async () => {
        const text = postTextarea.value.trim();
        if (!text && fileInput.files.length === 0) { alert("Please write some advice or attach a file!"); return; }

        let mediaUrl = null; let mediaType = null;
        try {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                submitPostBtn.innerText = "Uploading File...";
                
                const cloudName = "dnmmkwbjr"; 
                const uploadPreset = "ml_default"; 

                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", uploadPreset);

                const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: formData });
                const cloudData = await cloudinaryResponse.json();

                if (cloudData.error) throw new Error(cloudData.error.message);

                mediaUrl = cloudData.secure_url;
                if (file.type.startsWith('video/')) mediaType = 'video';
                else if (file.type === 'application/pdf') mediaType = 'pdf';
                else mediaType = 'image';
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
                authorProfilePic: currentUserProfilePic, 
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
            submitPostBtn.innerText = "Post";
        }
    });

    // COMMENTS (REPLY) SYSTEM
    const commentTextarea = document.getElementById("commentTextarea");
    const commentFileInput = document.getElementById("commentFileInput");
    const commentUploadBtn = document.getElementById("commentUploadBtn");
    const commentFileNameDisplay = document.getElementById("commentFileNameDisplay");
    const submitCommentBtn = document.getElementById("submitCommentBtn");
    const commentsContainer = document.getElementById("commentsContainer");

    if (commentUploadBtn) commentUploadBtn.addEventListener("click", () => commentFileInput.click());

    if (commentFileInput) {
        commentFileInput.addEventListener("change", () => {
            if (commentFileInput.files.length > 0) commentFileNameDisplay.innerText = commentFileInput.files[0].name;
        });
    }

    if (submitCommentBtn) {
        submitCommentBtn.addEventListener("click", async () => {
            if (!currentViewingPostId) return;

            const text = commentTextarea.value.trim();
            if (!text && commentFileInput.files.length === 0) return;

            let mediaUrl = null; let mediaType = null;
            const originalBtnText = submitCommentBtn.innerText;
            submitCommentBtn.innerText = "Sending...";
            submitCommentBtn.disabled = true;

            try {
                if (commentFileInput.files.length > 0) {
                    const file = commentFileInput.files[0];
                    submitCommentBtn.innerText = "Uploading...";
                    const cloudName = "dnmmkwbjr"; const uploadPreset = "ml_default"; 
                    const formData = new FormData(); formData.append("file", file); formData.append("upload_preset", uploadPreset);
                    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: formData });
                    const cloudData = await cloudinaryResponse.json();
                    if (cloudData.error) throw new Error(cloudData.error.message);

                    mediaUrl = cloudData.secure_url;
                    if (file.type.startsWith('video/')) mediaType = 'video';
                    else if (file.type === 'application/pdf') mediaType = 'pdf';
                    else mediaType = 'image';
                }

                await addDoc(collection(db, "comments"), {
                    postId: currentViewingPostId,
                    text: text,
                    authorEmail: auth.currentUser.email,
                    authorName: currentUserNickname, 
                    authorProfilePic: currentUserProfilePic, 
                    createdAt: new Date(),
                    mediaUrl: mediaUrl,
                    mediaType: mediaType
                });
                
                commentTextarea.value = ""; commentFileInput.value = ""; commentFileNameDisplay.innerText = "";
                submitCommentBtn.innerText = originalBtnText; submitCommentBtn.disabled = false;
                loadComments(currentViewingPostId); 
                
            } catch (error) {
                console.error("Comment Error: ", error);
                submitCommentBtn.innerText = originalBtnText; submitCommentBtn.disabled = false;
            }
        });
    }

    async function loadComments(postId) {
        commentsContainer.innerHTML = '<p style="color: #a4b0be; text-align:center; font-size: 13px; font-weight: bold; padding: 20px;">Loading replies...</p>';
        try {
            const q = query(collection(db, "comments"), where("postId", "==", postId));
            const querySnapshot = await getDocs(q);
            
            let commentsArray = [];
            querySnapshot.forEach((docSnap) => commentsArray.push({ id: docSnap.id, ...docSnap.data() }));
            commentsArray.sort((a, b) => (a.createdAt ? a.createdAt.toDate() : new Date()) - (b.createdAt ? b.createdAt.toDate() : new Date()));

            commentsContainer.innerHTML = "";
            if (commentsArray.length === 0) { commentsContainer.innerHTML = '<p style="color: #a4b0be; text-align:center; font-size: 13px; font-weight: bold; padding: 20px;">No replies yet. Be the first to help out!</p>'; return; }

            commentsArray.forEach((comment) => {
                const date = comment.createdAt ? comment.createdAt.toDate().toLocaleDateString() : "Just now";
                const avatarHtml = getAvatarHtml(comment.authorProfilePic, comment.authorName, 28);
                
                let mediaHtml = '';
                if (comment.mediaUrl) {
                    if (comment.mediaType === 'video') mediaHtml = `<video class="post-media" src="${comment.mediaUrl}" controls style="max-height: 200px; margin-top: 10px; border-radius: 8px;"></video>`;
                    else if (comment.mediaType === 'pdf') mediaHtml = `<a href="${comment.mediaUrl}" target="_blank" style="display:block; margin-top: 10px; padding: 10px; background: #f1e4ff; color: #764ba2; text-align: center; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 13px;">📄 Open Attached PDF</a>`;
                    else mediaHtml = `<img class="post-media" src="${comment.mediaUrl}" alt="Comment image" style="max-height: 200px; margin-top: 10px; border-radius: 8px;">`;
                }

                let deleteHtml = "";
                if (auth.currentUser && auth.currentUser.email === comment.authorEmail) {
                    deleteHtml = `<span class="delete-comment-btn" data-id="${comment.id}" style="color: #ff4757; font-size: 12px; font-weight: bold; cursor: pointer; margin-left: 10px;">Delete</span>`;
                }

                const commentDiv = document.createElement("div");
                commentDiv.className = "comment-card";
                commentDiv.innerHTML = `
                    <div class="comment-header" style="justify-content: flex-start; gap: 8px;">
                        ${avatarHtml}
                        <strong class="feed-username" data-username="${comment.authorName}">${comment.authorName}</strong>
                        <div style="margin-left: auto;">
                            <span class="comment-date">${date}</span>${deleteHtml}
                        </div>
                    </div>
                    <div class="comment-text" style="margin-left: 40px;">${comment.text}</div>
                    <div style="margin-left: 40px;">${mediaHtml}</div>
                `;
                
                // Clickable Username (Comments)
                commentDiv.querySelectorAll('.feed-username, .feed-avatar').forEach(el => {
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        triggerProfileSearch(comment.authorName);
                    });
                });

                commentsContainer.appendChild(commentDiv);
            });

            document.querySelectorAll('.delete-comment-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if(confirm("Are you sure you want to permanently delete your reply?")) {
                        e.target.innerText = "Deleting...";
                        await deleteDoc(doc(db, "comments", e.target.getAttribute('data-id')));
                        loadComments(postId);
                    }
                });
            });

        } catch (error) { console.error(error); }
    }
}
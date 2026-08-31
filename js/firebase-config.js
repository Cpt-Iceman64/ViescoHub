const firebaseConfig = {
  apiKey: "AIzaSyALBH6J848VpO9y8i-Jgjlxk_tFpcUkKcM",
  authDomain: "viescohub.firebaseapp.com",
  projectId: "viescohub",
  storageBucket: "viescohub.firebasestorage.app",
  messagingSenderId: "91727509950",
  appId: "1:91727509950:web:3d5040ec60cd187f7fe1ef"
};

// Initialisation via la version compat (qui marche avec file:///)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Helper functions exposées globalement
window.fbSet = function(collection, docId, data) {
    db.collection(collection).doc(docId).set(data)
      .catch(function(error) { console.error("Erreur de sauvegarde: ", error); });
};

window.fbGet = function(collection, docId) {
    return db.collection(collection).doc(docId).get()
      .then(function(doc) { return doc.exists ? doc.data() : null; })
      .catch(function(error) { console.error("Erreur de lecture: ", error); return null; });
};

window.fbListen = function(collection, docId, callback, onError) {
    return db.collection(collection).doc(docId).onSnapshot(function(doc) {
        if (doc.exists) {
            callback(doc.data());
        }
    }, function(error) {
        if (onError) onError(error);
        else console.error("Erreur d'écoute: ", error);
    });
};

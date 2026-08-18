    <script>
        (function() {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const partnerId = urlParams.get('id');
                
                const partnerContent = document.getElementById('partner-content');
                const errorMessage = document.getElementById('error-message');
                
                if (partnerId && typeof partnersData !== 'undefined' && partnersData[partnerId]) {
                    const data = partnersData[partnerId];
                    
                    // Update Meta & Title
                    document.title = data.name + ' - Partenaire | Indebel';
                    document.getElementById('hero-title').textContent = data.name;
                    document.getElementById('hero-subtitle').textContent = data.subtitle;
                    
                    // Update Card
                    document.getElementById('partner-logo').src = "/" + data.logo;
                    document.getElementById('partner-logo').alt = 'Logo ' + data.name;
                    document.getElementById('partner-description').innerHTML = data.description;
                    document.getElementById('partner-website-link').href = data.website;
                    
                    partnerContent.style.display = 'block';
                    errorMessage.style.display = 'none';
                } else {
                    partnerContent.style.display = 'none';
                    errorMessage.style.display = 'block';
                    document.getElementById('hero-title').textContent = 'Partenaire introuvable';
                    document.getElementById('hero-subtitle').textContent = 'Oups, il semble que ce partenaire n\\'existe pas.';
                }
            } catch (err) {
                console.error("Erreur d'initialisation:", err);
                document.getElementById('hero-subtitle').textContent = 'Erreur: ' + err.message;
            }
        })();
    </script>

---
title: "Email in spam: cosa sono SPF, DKIM e DMARC"
description: "Le tue email finiscono in spam o non arrivano? Spieghiamo in parole semplici cosa sono SPF, DKIM e DMARC e come si controlla la configurazione."
pubDate: 2026-10-04
category: "Sicurezza"
tags: ["email", "spf", "dkim", "dmarc", "dominio"]
featured: false
---

Mandi un preventivo e il cliente dice di non averlo mai ricevuto. Oppure arriva, ma nella cartella spam. Succede molto spesso alle piccole attività, e quasi sempre il problema è tecnico, non nel testo del messaggio.

## Perché le email vanno in spam

I provider come Gmail e Outlook devono capire se un messaggio che dice di arrivare da *tuaazienda.it* arriva davvero da te. Se il dominio non fornisce queste prove, o le fornisce sbagliate, la posta viene trattata con sospetto.

## SPF, DKIM e DMARC in parole semplici

- **SPF** è l'elenco dei server autorizzati a inviare email a nome del tuo dominio.
- **DKIM** è una firma digitale che dimostra che il messaggio non è stato alterato lungo la strada.
- **DMARC** dice ai provider cosa fare se i controlli precedenti falliscono e permette di ricevere dei report.

Sono impostazioni che si trovano nei **DNS** del dominio.

## Gli errori più comuni

- Più record SPF invece di uno solo
- Servizi che inviano email a nome tuo (newsletter, gestionale, modulo del sito) non inclusi
- DKIM mai attivato sul provider di posta
- Email del sito inviate dal server dell'hosting senza una configurazione corretta

## Come si controlla

Si verificano i record del dominio, si fanno prove di invio verso diversi provider e si guardano le intestazioni dei messaggi ricevuti. Se la configurazione è sbagliata, si corregge senza toccare le email già presenti.

Se vuoi che ce ne occupiamo noi, trovi i dettagli qui: <a href="/servizi/email-aziendale-in-spam">email aziendale che finisce in spam</a>. Se il problema riguarda il dominio in generale, guarda anche <a href="/servizi/gestione-domini-e-dns">gestione domini e DNS</a>.

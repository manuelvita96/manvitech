---
title: "Backup del sito: dove, quando e come verificare che funzioni"
description: "Un backup mai provato è solo una speranza. Dove salvarlo, ogni quanto farlo e come controllare che si possa davvero ripristinare."
pubDate: 2026-11-25
category: "Sicurezza"
tags: ["backup", "sicurezza", "wordpress", "manutenzione"]
featured: false
---

Quando si parla di backup del sito, la risposta più frequente è "ce l'ha l'hosting". A volte è vero, a volte no, e spesso nessuno ha mai controllato. Un backup che non è mai stato ripristinato è una speranza, non una garanzia.

Ecco quattro domande a cui dovresti saper rispondere.

## 1. Dove è salvato?

Se la copia si trova solo sullo stesso server del sito, un guasto grave, un errore o un attacco possono portarsi via tutto insieme. Una regola molto usata è quella del 3-2-1: tre copie dei dati, su due supporti diversi, di cui una fuori sede. Per un sito piccolo non serve complicarsi la vita, ma almeno una copia deve stare lontano dal server dove gira il sito.

## 2. Ogni quanto viene fatto?

Dipende da quanto cambia il sito. Un sito vetrina quasi fermo può bastare una copia settimanale o mensile. Un negozio online, con ordini che arrivano ogni giorno, ha bisogno di copie molto più frequenti: perdere una settimana di ordini non è un'opzione. Chiediti: se oggi dovessi tornare indietro all'ultima copia, quanto lavoro perderei?

## 3. Cosa contiene davvero?

Un backup completo comprende i file del sito e il database, dove stanno testi, utenti e ordini. Se la copia contiene solo una delle due parti, non è possibile ripristinare il sito. È un errore più comune di quanto si pensi, soprattutto nei backup configurati una volta e mai più guardati.

## 4. L'hai mai ripristinato?

È la domanda che conta di più. L'unico modo per sapere se un backup funziona è provare a usarlo, su una copia del sito e non su quello vero. Scoprire il problema durante una prova è fastidioso, scoprirlo durante un'emergenza è molto peggio.

## Backup e aggiornamenti vanno insieme

Prima di aggiornare WordPress, il tema o i plugin, una copia recente è la tua rete di sicurezza. È il motivo per cui nel nostro <a href="/servizi/aggiornamento-sicuro-wordpress">aggiornamento sicuro</a> facciamo sempre il backup per primo, proviamo l'aggiornamento su una copia e solo dopo lo applichiamo al sito vero.

Il backup serve anche in caso di attacco, ma attenzione: ripristinare una vecchia copia senza chiudere la falla fa ripetere il problema. Se ti trovi in questa situazione, leggi <a href="/blog/sito-wordpress-hackerato-cosa-fare">sito WordPress hackerato: cosa fare</a>.

## Non sai rispondere a una di queste domande?

È normale, e conviene guardarci prima che serva. <a href="/servizi/consulenza-sito-esistente">Il check iniziale è gratuito</a>: controlliamo come è fatto il sito e ti diciamo in modo semplice cosa manca.

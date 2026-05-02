const indianElectionData = {
  process: [
    {
      step: 1,
      title: "Check Eligibility",
      description: "You must be an Indian citizen, 18 years of age or older on the qualifying date (usually January 1st of the year of revision of electoral roll), and a resident of the polling area.",
      icon: "fa-solid fa-user-check"
    },
    {
      step: 2,
      title: "Register to Vote (Form 6)",
      description: "Submit Form 6 to the Electoral Registration Officer (ERO) of your Assembly Constituency. This can be done online via the Voter Portal (voters.eci.gov.in) or offline.",
      icon: "fa-solid fa-file-signature"
    },
    {
      step: 3,
      title: "Check Electoral Roll",
      description: "Before the election, verify your name is on the voter list (Electoral Roll). Having an EPIC (Voter ID) is not enough; your name MUST be on the roll.",
      icon: "fa-solid fa-list-check"
    },
    {
      step: 4,
      title: "Find Your Polling Station",
      description: "Locate your assigned polling booth. The Election Commission usually issues voter slips ahead of time, or you can check online or via SMS.",
      icon: "fa-solid fa-location-dot"
    },
    {
      step: 5,
      title: "Vote via EVM",
      description: "At the booth, your identity is verified. You proceed to the voting compartment and press the blue button next to your chosen candidate's symbol on the Electronic Voting Machine (EVM).",
      icon: "fa-solid fa-check-to-slot"
    }
  ],
  flashcards: [
    {
      term: "EVM",
      definition: "Electronic Voting Machine: Used in Indian elections to record votes. It consists of a Control Unit and a Balloting Unit."
    },
    {
      term: "VVPAT",
      definition: "Voter Verifiable Paper Audit Trail: An independent system attached to EVMs that allows voters to verify that their votes are cast as intended."
    },
    {
      term: "NOTA",
      definition: "None Of The Above: An option on the EVM allowing a voter to officially register a vote of rejection for all candidates."
    },
    {
      term: "EPIC",
      definition: "Electors Photo Identity Card: Commonly known as the Voter ID card, issued by the Election Commission of India."
    },
    {
      term: "MCC",
      definition: "Model Code of Conduct: A set of guidelines issued by the ECI regulating political parties and candidates prior to elections."
    },
    {
      term: "ECI",
      definition: "Election Commission of India: The autonomous constitutional authority responsible for administering election processes in India."
    }
  ],
  quiz: [
    {
      question: "What is the minimum voting age in India?",
      options: ["16", "18", "21", "25"],
      correctIndex: 1,
      explanation: "The 61st Amendment Act (1988) lowered the voting age from 21 to 18 years."
    },
    {
      question: "Which form is used for the inclusion of a name in the electoral roll for a first-time voter?",
      options: ["Form 6", "Form 7", "Form 8", "Form 8A"],
      correctIndex: 0,
      explanation: "Form 6 is used for new voter registration."
    },
    {
      question: "What does VVPAT stand for?",
      options: ["Voter Verified Paper Audit Trail", "Voting Validation Print Audit Trail", "Voter Verifiable Paper Audit Trail", "Valid Vote Print Audit Trail"],
      correctIndex: 2,
      explanation: "VVPAT stands for Voter Verifiable Paper Audit Trail, which prints a slip for the voter to verify their choice."
    },
    {
      question: "Who appoints the Chief Election Commissioner of India?",
      options: ["Prime Minister", "Chief Justice of India", "President of India", "Parliament"],
      correctIndex: 2,
      explanation: "The President of India appoints the Chief Election Commissioner."
    },
    {
      question: "If you don't want to vote for any candidate, which button do you press on the EVM?",
      options: ["VVPAT", "REJECT", "CANCEL", "NOTA"],
      correctIndex: 3,
      explanation: "NOTA (None Of The Above) is the option provided on the EVM for this purpose."
    }
  ],
  chatKnowledgeBase: [
    {
      keywords: ["register", "form 6", "enroll", "apply", "voter id"],
      response: "To register to vote in India, you need to fill out **Form 6**. You can do this online through the Voter Service Portal (voters.eci.gov.in) or by downloading the Voter Helpline App. Make sure you have proof of age and proof of address handy!"
    },
    {
      keywords: ["eligibl", "age", "who can vote"],
      response: "Any Indian citizen who is 18 years of age or older on the qualifying date (usually Jan 1st of the revision year) and is a resident of the polling area is eligible to vote."
    },
    {
      keywords: ["where", "polling station", "booth", "location"],
      response: "You can find your polling station by checking your name on the Electoral Search portal (electoralsearch.eci.gov.in) or by checking the voter slip issued by the Election Commission before election day."
    },
    {
      keywords: ["evm", "machine", "how to vote"],
      response: "At the polling booth, your identity will be verified. Then, you will go to the voting compartment where you will see the Electronic Voting Machine (EVM). Simply press the blue button next to the name and symbol of the candidate you wish to vote for. A red light will glow and you will hear a beep sound."
    },
    {
      keywords: ["vvpat", "paper", "verify"],
      response: "VVPAT stands for Voter Verifiable Paper Audit Trail. After you press the button on the EVM, a paper slip containing the serial number, name, and symbol of the candidate will be printed and visible behind a glass window for 7 seconds, allowing you to verify your vote."
    },
    {
      keywords: ["nota", "none", "reject"],
      response: "NOTA stands for 'None Of The Above'. It is the last button on the EVM. You can press it if you do not wish to vote for any of the candidates listed."
    },
    {
      keywords: ["hello", "hi", "hey", "start"],
      response: "Hello! I am your Indian Election Assistant. You can ask me questions about voter registration, EVMs, polling stations, or eligibility. How can I help you today?"
    }
  ]
};

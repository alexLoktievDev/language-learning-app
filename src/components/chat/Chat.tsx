import { FC, useState, useEffect, useRef, useCallback } from "react";
import { MessageBox } from "react-chat-elements";
import CloseIcon from "@mui/icons-material/Close";
import "react-chat-elements/dist/main.css";
import {
  AppBar,
  Avatar,
  Box,
  LinearProgress,
  Paper,
  Stack,
  IconButton,
  TextareaAutosize,
  Toolbar,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import SendIcon from "@mui/icons-material/Send";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import { useForm } from "react-hook-form";
import axios from "axios";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useTranslation } from "react-i18next";
import { useSpeechSynthesis } from "react-speech-kit";

type Message = {
  position: "left" | "right";
  type: "text" | "photo" | "video" | "audio" | "file";
  text: string;
  dateString: string;
  audioUrl?: string;
  isLoading?: boolean;
  language?: string; // Added language property
};

export type ChatFormValues = {
  message: string;
};

const createMarkup = (text: string) => {
  const htmlString = text.replace(/\n/g, "<br/>");
  return { __html: htmlString };
};

const removeEmojis = (text: string) => {
  return text.replace(
    /([\uD800-\uDBFF][\uDC00-\uDFFF]|\u2600-\u26FF|\u2700-\u27BF|\uE000-\uF8FF|\uD83C\uD000-\uD83C\uDFFF|\uD83D\uD000-\uD83D\uDFFF|\uD83E\uD000-\uD83E\uDFFF)/g,
    "",
  );
};

const MessageComponent: FC<{
  message: Message;
  playAudio: (audioUrl: string) => void;
  isPlaying: boolean;
  speakMessage: (text: string, language: string) => void;
  isSpeaking: boolean;
}> = ({ message, playAudio, isPlaying, speakMessage, isSpeaking }) => (
  <Stack
    alignItems="center"
    position="relative"
    justifyContent={message.position === "left" ? "flex-start" : "flex-end"}
  >
    <MessageBox
      // @ts-ignore
      position={message.position as any} // Cast to any if TypeScript complains
      type={message.type}
      styles={{ textAlign: "left", maxWidth: "50%" }}
      text={<div dangerouslySetInnerHTML={createMarkup(message.text)} />}
      date={new Date()}
      unread={0}
      dateString={message.dateString}
    />
    <Stack
      spacing={0.2}
      direction="row"
      position="absolute"
      sx={{ [message.position]: 25, bottom: 5 }}
    >
      {message.audioUrl ? (
        message.isLoading ? (
          <CircularProgress size={24} />
        ) : (
          <IconButton
            sx={{ minWidth: 30 }}
            onClick={() => !isPlaying && playAudio(message.audioUrl!)}
          >
            <PlayCircleIcon />
          </IconButton>
        )
      ) : null}
      <IconButton
        sx={{ minWidth: 30 }}
        onClick={() =>
          !isSpeaking && speakMessage(message.text, message.language || "en-US")
        }
      >
        <TranslateIcon />
      </IconButton>
    </Stack>
  </Stack>
);

export const Chat: FC<{
  onCloseButtonClick: () => void;
  fullWidth?: boolean;
  assistantContext?: string;
}> = ({ onCloseButtonClick, fullWidth, assistantContext, ...rest }) => {
  const { t } = useTranslation();
  const { speak, voices } = useSpeechSynthesis();
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState<string>("en-US");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastSpokenMessage, setLastSpokenMessage] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const { handleSubmit, watch, setValue, reset, register } =
    useForm<ChatFormValues>();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    finalTranscript,
    interimTranscript,
  } = useSpeechRecognition();

  console.log(99992293344, assistantContext);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakMessage = useCallback(
    (text: string, language: string) => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
      const sanitizedText = removeEmojis(text);
      const utterance = new SpeechSynthesisUtterance(sanitizedText);
      let selectedVoice: SpeechSynthesisVoice | null = null;

      if (language === "es-ES") {
        selectedVoice =
          (voices.find((voice) =>
            voice.name.toLowerCase().includes("google español"),
          ) as any) || null;
      } else if (language === "uk-UA") {
        selectedVoice =
          (voices.find((voice) =>
            voice.name.toLowerCase().includes("lesya"),
          ) as any) || null;
      } else {
        selectedVoice =
          (voices.find((voice) =>
            ["samantha", "victoria", "karen"].some((name) =>
              voice.name.toLowerCase().includes(name),
            ),
          ) as any) || null;
      }

      if (!selectedVoice) {
        selectedVoice =
          (voices.find((voice) =>
            ["google us english", "google uk english female"].some((name) =>
              voice.name.toLowerCase().includes(name),
            ),
          ) as any) || null;
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    },
    [isSpeaking, voices],
  );

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.error(t("Browser doesn't support speech recognition."));
      return;
    }
    if (!listening) {
      setValue("message", finalTranscript + interimTranscript);
    }
  }, [
    transcript,
    setValue,
    browserSupportsSpeechRecognition,
    finalTranscript,
    interimTranscript,
    t,
    listening,
  ]);

  useEffect(() => {
    if (
      messages.length > 0 &&
      messages[messages.length - 1].position === "left"
    ) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.text !== lastSpokenMessage) {
        speakMessage(lastMessage.text, language);
        setLastSpokenMessage(lastMessage.text);
      }
    }
  }, [messages, language, speakMessage, lastSpokenMessage]);

  const onSubmit = async ({ message }: ChatFormValues) => {
    setMessages((prevState) => [
      ...prevState,
      {
        position: "right",
        type: "text",
        text: message,
        dateString: new Date().toLocaleTimeString(),
        language,
      },
    ]);

    reset();
    resetTranscript();

    setIsTyping(true);
    try {
      const result = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/chatWithOpenAIHttp`,
        { prompt: message, assistantContext },
        { headers: { "Content-Type": "application/json" } },
      );

      const reply = result.data.reply;

      setMessages((prevState) => [
        ...prevState,
        {
          position: "left",
          type: "text",
          text: reply,
          dateString: new Date().toLocaleTimeString(),
          isLoading: false,
          language,
        },
      ]);
    } catch (error) {
      console.error(t("Failed to get a response from OpenAI"), error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.play();
    audio.onended = () => {
      setIsPlaying(false);
    };
  };

  const startListening = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    resetTranscript(); // Clear the transcript before starting a new session
    SpeechRecognition.startListening({ continuous: true, language });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    resetTranscript(); // Clear the transcript when stopping
  };

  useEffect(() => {
    setValue("message", transcript);
  }, [transcript, setValue]);

  return (
    <Stack
      direction="column"
      maxWidth={fullWidth ? "100%" : 300}
      component={Paper}
      elevation={6}
      spacing={2}
      sx={{
        backgroundColor: "#F5F9FD",
        position: fullWidth ? "fixed" : "relative",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }}
      height={fullWidth ? "100%" : 500}
      {...rest}
    >
      <Box width="100%">
        <Stack
          direction="row"
          width="100%"
          justifyContent="flex-end"
          component={AppBar}
          sx={{ justifyContent: "stretch" }}
          position="static"
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {fullWidth && (
              <IconButton
                onClick={onCloseButtonClick}
                sx={{ marginRight: "auto" }}
              >
                <ArrowBackIcon sx={{ color: "#fff" }} />
              </IconButton>
            )}

            <Stack direction="row" width="100%" spacing={1}>
              <div>
                <Avatar
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb5mTYXD2gv9hkFvxj81DYRX8UXdD_M7DQqlxniYzG8Q&s"
                  alt="AI avatar"
                />
              </div>

              <Stack direction="column" spacing={1}>
                <Typography>{t("First lesson")}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={20}
                  sx={{ height: "6px" }}
                />
              </Stack>
            </Stack>

            <Select
              labelId="language-select-label"
              value={language}
              variant="outlined"
              onChange={(e) => setLanguage(e.target.value)}
              label={t("Language")}
            >
              <MenuItem value="en-US">{t("English (US)")}</MenuItem>
              <MenuItem value="es-ES">{t("Spanish (Spain)")}</MenuItem>
              <MenuItem value="uk-UA">{t("Ukrainian")}</MenuItem>
            </Select>

            {!fullWidth && (
              <IconButton
                onClick={onCloseButtonClick}
                sx={{ marginLeft: "auto" }}
              >
                <CloseIcon sx={{ color: "#fff" }} />
              </IconButton>
            )}
          </Toolbar>
        </Stack>
      </Box>

      <Stack
        direction="column"
        spacing={2}
        justifyContent="space-between"
        flexGrow={1}
        overflow="auto"
      >
        <Box padding="0 10px 10px" flexGrow={1}>
          {messages.map((msg, index) => (
            <MessageComponent
              key={index}
              message={msg}
              playAudio={playAudio}
              isPlaying={isPlaying}
              speakMessage={speakMessage}
              isSpeaking={isSpeaking}
            />
          ))}

          {isTyping && (
            <Box display="flex" alignItems="center" mt={2}>
              <Typography style={{ marginLeft: 10 }}>
                {t("Is typing...")}
              </Typography>
            </Box>
          )}
        </Box>

        <Box
          position="sticky"
          component="form"
          bottom={0}
          onSubmit={handleSubmit(onSubmit)}
          left={0}
          right={0}
          marginTop="auto"
          sx={{
            display: "flex",
            alignItems: "center",
            background: "#1F8DFB",
            padding: "10px",
          }}
        >
          <TextareaAutosize
            minRows={3}
            maxRows={6}
            style={{
              width: "100%",
              padding: 8,
              marginRight: "6px",
              resize: "none",
            }}
            placeholder={t("Type your message...")}
            onKeyDown={handleKeyDown}
            {...register("message")}
          />

          {listening ? (
            <IconButton onClick={stopListening} sx={{ minWidth: 30 }}>
              <KeyboardVoiceIcon sx={{ color: "red" }} />
            </IconButton>
          ) : (
            <IconButton onClick={startListening} sx={{ minWidth: 30 }}>
              <KeyboardVoiceIcon sx={{ color: "#fff" }} />
            </IconButton>
          )}

          <IconButton
            type="submit"
            sx={{ minWidth: 30 }}
            disabled={listening || !watch("message")?.length}
          >
            <SendIcon sx={{ color: "#fff" }} />
          </IconButton>
        </Box>
      </Stack>
    </Stack>
  );
};

import { FC, useState, useEffect, useRef } from "react";
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

type Message = {
  position: "left" | "right";
  type: "text" | "photo" | "video" | "audio" | "file";
  text: string;
  dateString: string;
  audioUrl?: string;
  isLoading?: boolean;
};

export type ChatFormValues = {
  message: string;
};

const createMarkup = (text: string) => {
  const htmlString = text.replace(/\n/g, "<br/>");
  return { __html: htmlString };
};

const MessageComponent: FC<{
  message: Message;
  playAudio: (audioUrl: string) => void;
  isPlaying: boolean;
}> = ({ message, playAudio, isPlaying }) => (
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
      <IconButton sx={{ minWidth: 30 }}>
        <TranslateIcon />
      </IconButton>
    </Stack>
  </Stack>
);

export const Chat: FC<{
  onCloseButtonClick: () => void;
  fullWidth?: boolean;
}> = ({ onCloseButtonClick, fullWidth, ...rest }) => {
  const { t } = useTranslation();
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState<string>("en-US"); // Default language
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

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

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.error(t("Browser doesn't support speech recognition."));
      return;
    }
    setValue("message", finalTranscript + interimTranscript);
  }, [
    transcript,
    setValue,
    browserSupportsSpeechRecognition,
    finalTranscript,
    interimTranscript,
    t,
  ]);

  /**
   * Handle form submission
   * @param {ChatFormValues} param0 - form values
   */
  const onSubmit = async ({ message }: ChatFormValues) => {
    setMessages((prevState) => [
      ...prevState,
      {
        position: "right",
        type: "text",
        text: message,
        dateString: new Date().toLocaleTimeString(),
      },
    ]);

    reset();
    resetTranscript(); // Clear the transcript after submitting

    setIsTyping(true);
    try {
      const result = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/chatWithOpenAIHttp`,
        { prompt: message },
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
          isLoading: true,
        },
      ]);

      // Convert response text to speech
      await handleConvertToSpeech(reply);
    } catch (error) {
      console.error(t("Failed to get a response from OpenAI"), error);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Handle key down event for textarea
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} event - key down event
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  /**
   * Handle converting text to speech
   * @param {string} textToConvert - text to convert to speech
   */
  const handleConvertToSpeech = async (textToConvert: string) => {
    setMessages((prevState) => {
      const newState = [...prevState];
      const lastIndex = newState.length - 1;
      newState[lastIndex].isLoading = true;
      return newState;
    });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/synthesizeSpeech`,
        { text: textToConvert, voiceId: "21m00Tcm4TlvDq8ikWAM", language },
        {
          headers: { "Content-Type": "application/json" },
          responseType: "arraybuffer",
        },
      );

      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      setMessages((prevState) => {
        const newState = [...prevState];
        const lastIndex = newState.length - 1;
        newState[lastIndex].audioUrl = audioUrl;
        newState[lastIndex].isLoading = false;
        return newState;
      });

      playAudio(audioUrl);
    } catch (error) {
      console.error(t("Error converting text to speech:"), error);
      setMessages((prevState) => {
        const newState = [...prevState];
        const lastIndex = newState.length - 1;
        newState[lastIndex].isLoading = false;
        return newState;
      });
    }
  };

  /**
   * Play audio from given URL
   * @param {string} audioUrl - URL of the audio to play
   */
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

  /**
   * Start listening for audio input
   */
  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true, language });
  };

  /**
   * Stop listening for audio input and process the audio
   */
  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

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
              <MenuItem value="fr-FR">{t("French (France)")}</MenuItem>
              <MenuItem value="de-DE">{t("German (Germany)")}</MenuItem>
              <MenuItem value="zh-CN">{t("Chinese (Mandarin)")}</MenuItem>
              <MenuItem value="uk-UA">{t("Ukrainian")}</MenuItem>
              <MenuItem value="ru-RU">{t("Russian")}</MenuItem>
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
            disabled={!watch("message")?.length}
          >
            <SendIcon sx={{ color: "#fff" }} />
          </IconButton>
        </Box>
      </Stack>
    </Stack>
  );
};

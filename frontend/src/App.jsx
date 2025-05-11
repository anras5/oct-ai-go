import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  Image,
  Input,
  Text,
  VStack,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Spinner,
  HStack,
} from "@chakra-ui/react";
import { AttachmentIcon, CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSelectedFile(file);

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Reset analysis when a new file is selected
    setAnalysis(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image to analyze",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("http://localhost:8080/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      setAnalysis(result);

      toast({
        title: "Analysis complete",
        description: `Detected: ${result.disease}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Analysis failed",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDiseaseColor = (disease) => {
    if (!disease) return "gray";

    switch (disease.toUpperCase()) {
      case "NORMAL":
        return "green";
      case "DME":
      case "AMD":
        return "red";
      default:
        return "purple";
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>
            OCT Scan Analysis
          </Heading>
          <Text color="gray.600">
            Upload an OCT scan image for AI-powered disease detection
          </Text>
        </Box>

        <Card>
          <CardBody>
            <VStack spacing={4}>
              <Flex
                direction="column"
                border="2px dashed"
                borderColor="gray.200"
                borderRadius="md"
                p={6}
                w="full"
                alignItems="center"
                justifyContent="center"
                bgColor="gray.50"
                _hover={{ borderColor: "blue.400", cursor: "pointer" }}
                onClick={() => document.getElementById("file-input").click()}
              >
                <AttachmentIcon boxSize={8} color="gray.400" mb={3} />
                <Text mb={2} fontWeight="medium">
                  Drag and drop your image here or click to browse
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Supported formats: JPG, PNG
                </Text>
                <Input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden
                />
              </Flex>

              {selectedFile && (
                <Text fontSize="sm" fontWeight="medium">
                  Selected: {selectedFile.name} (
                  {Math.round(selectedFile.size / 1024)} KB)
                </Text>
              )}

              <Button
                colorScheme="blue"
                isLoading={isLoading}
                loadingText="Analyzing..."
                isDisabled={!selectedFile || isLoading}
                onClick={handleUpload}
                width="full"
              >
                Analyze Image
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {isLoading && (
          <Flex justify="center" align="center" p={8}>
            <Spinner size="xl" thickness="4px" color="blue.500" />
          </Flex>
        )}

        {error && (
          <Card bg="red.50">
            <CardBody>
              <Flex align="center">
                <WarningIcon color="red.500" mr={3} />
                <Text color="red.700">{error}</Text>
              </Flex>
            </CardBody>
          </Card>
        )}

        {preview && !isLoading && (
          <Flex direction={{ base: "column", md: "row" }} gap={6}>
            {/* Image Preview */}
            <Box flex="1">
              <Card overflow="hidden">
                <CardHeader pb={2}>
                  <Heading size="md">Image Preview</Heading>
                </CardHeader>
                <CardBody>
                  <Image
                    src={preview}
                    alt="OCT Scan Preview"
                    borderRadius="md"
                    objectFit="contain"
                    maxH="300px"
                    w="full"
                  />
                </CardBody>
              </Card>
            </Box>

            {/* Analysis Results */}
            {analysis && (
              <Box flex="1">
                <Card>
                  <CardHeader>
                    <Heading size="md">Analysis Results</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" spacing={4}>
                      <HStack>
                        <Text fontWeight="bold">Detected Disease:</Text>
                        <Badge
                          colorScheme={getDiseaseColor(analysis.disease)}
                          fontSize="md"
                          px={2}
                          py={1}
                        >
                          {analysis.disease}
                        </Badge>
                      </HStack>

                      {analysis.isOCTScan !== undefined && (
                        <HStack>
                          <Text fontWeight="bold">Scan Type:</Text>
                          <Flex align="center">
                            {analysis.isOCTScan ? (
                              <>
                                <CheckCircleIcon color="green.500" mr={1} />
                                <Text>Confirmed OCT Scan</Text>
                              </>
                            ) : (
                              <>
                                <WarningIcon color="orange.500" mr={1} />
                                <Text>Not an OCT Scan</Text>
                              </>
                            )}
                          </Flex>
                        </HStack>
                      )}

                      <Divider />

                      <Box>
                        <Text fontWeight="bold" mb={1}>
                          Analysis Explanation:
                        </Text>
                        <Text>{analysis.explanation}</Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </Box>
            )}
          </Flex>
        )}
      </VStack>

      <Divider my={8} />

      <Text textAlign="center" fontSize="sm" color="gray.500">
        © 2025 OCT Scan Analysis Tool
      </Text>
    </Container>
  );
}

export default App;

/*
    HTTP webclient code that sends to and/or gets data from the local web server.
    
    CREDITS: Original code by Leonardo Gonçalves - Instituto Nacional de Telecomunicações INATEL - Brazil
    EDITS: By Timothy Woo, Stephane Come
*/
#include <ESP8266WiFi.h>

const char* ssid     = "your_wifi_network";   // replace with your WiFi network name
const char* password = "your_wifi_password";  // replace iwth your WiFi password
String pubString;

// Set your computer IP address
const char* host = "your_server_ip_address";  //example: 192.168.1.17
const int httpPort = 8080;                    // the local port number

int sensor_pin = A0; // Set  pin you are using to read data. In this case it's analog for reading pH values
float value = 0;     // Initialize the value you are going to read
const int sleepTimeS = 1*10; // Set sleep time in seconds for the deep sleep cycle

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
  delay(100);

  // We start by connecting to the local WiFi network
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on (HIGH is the voltage level)
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP()); // This is your NodeMCU IP address. Could be handy for other projects

}

void loop()
{
  digitalWrite(LED_BUILTIN, LOW);    // turn the LED off by making the voltage LOW

  GET();  // Send a GET request for testing
  digitalWrite(LED_BUILTIN, HIGH);    // turn the LED off by making the voltage LOW
  delay(5000);
}

void GET(void)
{
  int state_pos;
  String state;
  value = analogRead(sensor_pin); // Read sensor value
  Serial.print("connecting to ");
  Serial.println(host);
  // Use WiFiClient class to create TCP connections
  WiFiClient client;
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    return;
  }
  pubString = "{\"value\": " + String(value) + "}";
  String pubStringLength = String(pubString.length(), DEC);
  // We now create a URI for the request
  Serial.print("Requesting GET: ");
  // This will send the request to the server
  client.println("GET /channels/your_channel_id.json?api_key=your_key&field1=" + String(value) + " HTTP/1.1");
  client.println("Connection: close");
  client.println();
  delay(500);
  // Read all the lines of the reply from server and print them to Serial
  while (client.available()) {
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }
  Serial.println("closing connection");
}

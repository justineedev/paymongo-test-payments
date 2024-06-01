import {
  ActionIcon,
  Box,
  Button,
  Card,
  Container,
  Group,
  Image,
  NumberFormatter,
  Stack,
  Table,
  Tabs,
  Text,
} from "@mantine/core";

import "./App.css";

import PaymongoLogo from "./assets/paymongo_logo.png";
import Milktea from "./assets/milktea.png";
import PaymongoIcon from "./assets/paymongo_icon.png";
import { IconCoins, IconCup, IconMinus, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [qty, setQty] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [payments, setPayments] = useState([]);

  const getPayments = () => {
    axios({
      method: "GET",
      url: "/payments?limit=100",
    })
      .then(({ data }) => {
        console.log(data);
        if (!!data.data) setPayments(data.data);
      })
      .catch(() =>
        toast.error("An error occurred while fetching payments", {
          position: "top-center",
        })
      );
  };

  useEffect(() => {
    setTotal(qty * 119);
  }, [qty]);

  useEffect(() => {
    getPayments();
  }, []);

  const handleClickPay = () => {
    setLoading(true);
    axios({
      method: "POST",
      url: "/links",
      data: {
        data: {
          attributes: {
            amount: total * 100,
            description: `${qty} Original Milktea`,
            remarks: "",
          },
        },
      },
    })
      .then(({ data }) => {
        const { checkout_url, reference_number } = data.data.attributes;
        setTimeout(() => {
          handleOpenPaymongoLink(checkout_url, reference_number);
        }, 500);
      })
      .catch(({ message }) => {
        toast.error(message || "An error occurred", {
          position: "top-center",
        });
        setLoading(false);
      });
  };

  const handleOpenPaymongoLink = (checkout_url, reference_number) => {
    const paymongoWindow = window.open(
      checkout_url,
      "_blank",
      "height=600 width=500 top=" +
        (window.outerHeight / 2 + window.screenY - 600 / 2) +
        ",left=" +
        (window.outerWidth / 2 + window.screenX - 500 / 2)
    );

    const checkPaymongoWindow = setInterval(() => {
      if (paymongoWindow.closed) {
        clearInterval(checkPaymongoWindow);

        setTimeout(() => {
          axios({
            method: "GET",
            url: `/links?reference_number=${reference_number}`,
          })
            .then(({ data }) => {
              setQty(0);
              getPayments();
              if (data.data[0].attributes.status === "unpaid")
                toast.error("Payment unsuccessful", {
                  position: "top-center",
                });
              else
                toast.success("Payment successful", { position: "top-center" });
            })
            .catch(() =>
              toast.success("An error occurred", { position: "top-center" })
            )
            .finally(() => setLoading(false));
        }, 2000);
      }
    }, 500);

    return () => {
      clearInterval(checkPaymongoWindow);
    };
  };

  return (
    <>
      <ToastContainer />
      <Container
        size="lg"
        mih="100vh"
        bg="#121212"
        style={{
          display: "grid",
          placeItems: "center",
        }}
      >
        <Box>
          <Image
            src={PaymongoLogo}
            alt="Logo"
            maw={400}
            w="100%"
            h="auto"
            mb={100}
          />

          <Tabs defaultValue="product">
            <Tabs.List grow>
              <Tabs.Tab
                value="product"
                leftSection={<IconCup />}
                color="#31a27c"
              >
                Product
              </Tabs.Tab>
              <Tabs.Tab
                value="payments"
                leftSection={<IconCoins />}
                color="#31a27c"
              >
                Payments
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="product" h={500}>
              <Card
                withBorder
                w="100%"
                maw={400}
                radius="md"
                p="md"
                mt="lg"
                mx="auto"
                style={{
                  background: "rgba( 179, 174, 174, 0.25 )",
                  boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )",
                  backdropFilter: "blur( 6.5px )",
                  WebkitBackdropFilter: " blur( 6.5px )",
                  border: "1px solid rgba( 255, 255, 255, 0.18 )",
                }}
              >
                <Card.Section>
                  <Box>
                    <Image
                      src={Milktea}
                      alt="Product"
                      mah={300}
                      h="auto"
                      w="100%"
                      fit="contain"
                    />
                  </Box>
                </Card.Section>

                <Card.Section p="xs">
                  <Group justify="space-between" c="#ffffff">
                    <Text>Original Milktea</Text>
                    <NumberFormatter prefix="₱" value={119} />
                  </Group>
                </Card.Section>

                <Group justify="space-between" align="center" mt="xs">
                  <ActionIcon
                    variant="outline"
                    color="#31a27c"
                    className="minus_btn"
                    disabled={!qty}
                    onClick={() => setQty((qty) => qty - 1)}
                  >
                    <IconMinus />
                  </ActionIcon>

                  <Text c="#ffffff">{qty}</Text>

                  <ActionIcon
                    variant="outline"
                    color="#31a27c"
                    onClick={() => setQty((qty) => qty + 1)}
                  >
                    <IconPlus />
                  </ActionIcon>
                </Group>
              </Card>

              <Box mx="auto" mt={20}>
                <Group c="#ffffff" align="center" justify="space-between">
                  <Stack gap={0}>
                    <Text>Total Amount</Text>
                    <NumberFormatter
                      prefix="₱"
                      value={total}
                      thousandSeparator
                    />
                  </Stack>
                  <Button
                    color="#31a27c"
                    className="pay_btn"
                    disabled={!qty || !total}
                    loading={loading}
                    leftSection={
                      <Image src={PaymongoIcon} alt="Paymongo icon" w={20} />
                    }
                    onClick={handleClickPay}
                  >
                    Pay
                  </Button>
                </Group>
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="payments" h={500} mt="lg">
              <Table.ScrollContainer mah={500} style={{ overflow: "auto" }}>
                <Table stickyHeader borderColor="#31a27c" withTableBorder>
                  <Table.Thead className="thead">
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Product</Table.Th>
                      <Table.Th>Amount</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody className="tbody">
                    {payments ? (
                      payments.map(({ attributes }, index) => (
                        <Table.Tr key={index}>
                          <Table.Td>{attributes.billing.name}</Table.Td>
                          <Table.Td>{attributes.description}</Table.Td>
                          <Table.Td>
                            <NumberFormatter
                              prefix="₱"
                              value={attributes.amount / 100}
                              thousandSeparator
                              decimalScale={2}
                              style={{ fontWeight: 600 }}
                            />
                          </Table.Td>
                        </Table.Tr>
                      ))
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={3}>No Payments</Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Container>
    </>
  );
}

export default App;

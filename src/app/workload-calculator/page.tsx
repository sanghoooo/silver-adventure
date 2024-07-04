"use client";

import {
	Button,
	Divider,
	HStack,
	ListItem,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	RangeSliderMark,
	Text,
	UnorderedList,
	VStack,
} from "@chakra-ui/react";
import { tgothic } from "../fonts";
import {
	RangeSlider,
	RangeSliderTrack,
	RangeSliderFilledTrack,
	RangeSliderThumb,
} from "@chakra-ui/react";
import { ReactNode, useMemo, useState } from "react";
import useSWRMutation from "swr/mutation";

export default function Home() {
	const [values, setValues] = useState([10, 40]);
	const [workAmount, setWorkAmount] = useState(100);
	const [{ easy, normal, hard }, setDifficulty] = useState({
		easy: 35,
		normal: 40,
		hard: 25,
	});
	const minWorkTime = useMemo(() => values[0], [values]);
	const maxWorkTime = useMemo(() => values[1], [values]);
	const middleWorkTime = useMemo(
		() => minWorkTime + (maxWorkTime - minWorkTime) / 2,
		[minWorkTime, maxWorkTime]
	);
	const calculate = useSWRMutation(
		"calculate",
		async () => {
			await delay(500);

			const x = [
				minWorkTime * workAmount,
				middleWorkTime * workAmount,
				maxWorkTime * workAmount,
			];
			const w = [easy, normal, hard];
			const n = x.length;
			const workHours = weightedMean(x, w, n);
			const workDays = workHours / 8;
			const workDaysPerPerson = workDays / 4;

			return {
				workHours,
				workDays,
				workDaysPerPerson,
			};
		},
		{
			onSuccess: ({ workHours, workDays, workDaysPerPerson }) =>
				alert(
					`업무 기준: ${beautifyNumber(
						workDays
					).toLocaleString()}일 (${beautifyNumber(
						workHours
					).toLocaleString()}시간)\n\nBE 개발자 1인 당 (4인 기준): ${beautifyNumber(
						workDaysPerPerson
					).toLocaleString()}일 (휴일 포함: ${beautifyNumber(
						containWeekend(workDaysPerPerson)
					).toLocaleString()}일)`
				),
		}
	);

	return (
		<VStack py={20} spacing={14} w={600} mx="auto">
			<VStack spacing={0}>
				<Text className={tgothic.className} fontSize={"3xl"} fontWeight={"bold"}>
					Workload Calculator
				</Text>
				<Text className={tgothic.className}>for N 서비스</Text>
			</VStack>
			<Divider />
			<SectionStack>
				<SectionTitle>개발 업무 시간을 설정하세요.</SectionTitle>
				<RangeSlider
					aria-label={["min", "max"]}
					min={1}
					max={100}
					value={values}
					onChange={(val) => setValues(val)}
					my={5}
				>
					<RangeSliderTrack>
						<RangeSliderFilledTrack />
					</RangeSliderTrack>
					<RangeSliderThumb index={0} />
					<RangeSliderThumb index={1} />
					<RangeSliderMark value={values[0]} mt={3} fontSize={"2xs"} fontWeight={"bold"}>
						최소 업무 시간: {values[0]}시간
					</RangeSliderMark>
					<RangeSliderMark
						value={values[1]}
						mt={-6}
						fontSize={"2xs"}
						fontWeight={"bold"}
						whiteSpace={"nowrap"}
					>
						최대 업무 시간: {values[1]}시간
					</RangeSliderMark>
				</RangeSlider>
				<CommentList
					items={["I/F: 분석 시간 + 개발 시간", "SVC: I/F 연동 시간 + SVC 연동 시간"]}
				/>
			</SectionStack>
			<SectionStack>
				<SectionTitle>개발 수량을 입력하세요.</SectionTitle>
				<NumberInput
					w="100%"
					value={workAmount}
					onChange={(value) => setWorkAmount(Number(value))}
					min={0}
				>
					<NumberInputField />
					<NumberInputStepper>
						<NumberIncrementStepper />
						<NumberDecrementStepper />
					</NumberInputStepper>
				</NumberInput>
				<CommentList items={["단위: 건"]} />
			</SectionStack>
			<SectionStack>
				<SectionTitle>개발 난이도 비중을 각각 입력하세요.</SectionTitle>
				<HStack spacing={4}>
					<NumberInputWithTitle
						title={`쉬움 (${minWorkTime}시간 소요)`}
						value={easy}
						handleChange={(value) =>
							setDifficulty((previous) => ({ ...previous, easy: Number(value) }))
						}
					/>
					<NumberInputWithTitle
						title={`일반적임 (${beautifyNumber(middleWorkTime)}시간 소요)`}
						value={normal}
						handleChange={(value) =>
							setDifficulty((previous) => ({ ...previous, normal: Number(value) }))
						}
					/>
					<NumberInputWithTitle
						title={`어려움 (복잡도 or 절대량, ${maxWorkTime}시간 소요)`}
						value={hard}
						handleChange={(value) =>
							setDifficulty((previous) => ({ ...previous, hard: Number(value) }))
						}
					/>
				</HStack>
				<CommentList items={["단위: 백분율"]} />
			</SectionStack>
			<VStack w="100%" spacing={3}>
				<Button
					w="100%"
					isLoading={calculate.isMutating}
					onClick={() => calculate.trigger()}
				>
					Go for it!
				</Button>
				<Text fontSize={"xs"} opacity={0.5} fontWeight={"bold"}>
					소요 시간 * 개발 수량 * 난이도를 가중하여, 가중 평균 시간을 획득
				</Text>
			</VStack>
		</VStack>
	);
}

function SectionStack({ children }: { children: ReactNode }) {
	return (
		<VStack alignItems={"flex-start"} w="100%" spacing={3}>
			{children}
		</VStack>
	);
}

function SectionTitle({ children }: { children: ReactNode }) {
	return (
		<Text fontSize={"lg"} className={tgothic.className} mb={1}>
			{children}
		</Text>
	);
}

function CommentList({ items }: { items: string[] }) {
	return (
		<UnorderedList fontSize={"xs"} opacity={0.5} fontWeight={"bold"}>
			{items.map((item, index) => (
				<ListItem key={index}>{item}</ListItem>
			))}
		</UnorderedList>
	);
}

function NumberInputWithTitle({
	title,
	value,
	handleChange,
}: {
	title: string;
	value: number;
	handleChange: (value: string) => void;
}) {
	return (
		<VStack>
			<Text fontSize={"2xs"} fontWeight={"bold"}>
				{title}
			</Text>
			<NumberInput value={value} onChange={handleChange}>
				<NumberInputField />
				<NumberInputStepper>
					<NumberIncrementStepper />
					<NumberDecrementStepper />
				</NumberInputStepper>
			</NumberInput>
		</VStack>
	);
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function weightedMean(x: number[], w: number[], n: number) {
	let sum = 0,
		numWeight = 0;

	for (let i = 0; i < n; i++) {
		numWeight = numWeight + x[i] * w[i];
		sum = sum + w[i];
	}

	return numWeight / sum;
}

function beautifyNumber(num: number) {
	return parseFloat(num.toFixed(1));
}

function containWeekend(days: number) {
	return Math.floor(days / 5) * 7 + (days % 5);
}
